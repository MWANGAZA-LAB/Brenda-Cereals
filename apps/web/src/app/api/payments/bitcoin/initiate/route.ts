import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { bitcoinService } from '@/lib/bitcoin';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId, amount } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the user and order
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
        status: 'PENDING'
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or already processed' },
        { status: 404 }
      );
    }

    // Verify amount matches order total
    if (Math.abs(amount - order.total) > 0.01) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Create Bitcoin payment
    const bitcoinPayment = await bitcoinService.createPayment({
      amount: order.total,
      orderId: order.id,
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        method: 'BITCOIN',
        status: 'PENDING',
        amount: order.total,
        bitcoinAddress: bitcoinPayment.address,
        bitcoinAmount: parseFloat(bitcoinPayment.amount),
      },
    });

    // Start monitoring payment
    bitcoinService.monitorPayment(
      bitcoinPayment.address,
      parseFloat(bitcoinPayment.amount),
      async (result) => {
        if (result.success) {
          // Update payment status
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              confirmedAt: new Date(),
              bitcoinTxHash: result.txid,
            },
          });

          // Update order status
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              paidAt: new Date(),
              paymentId: result.txid,
            },
          });

          console.log(`Bitcoin payment confirmed for order ${orderId}`);
        }
      }
    );

    return NextResponse.json({
      success: true,
      address: bitcoinPayment.address,
      amount: parseFloat(bitcoinPayment.amount),
      qrCode: bitcoinPayment.qrCode,
      expiresAt: bitcoinPayment.expiresAt,
    });

  } catch (error) {
    console.error('Bitcoin payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
