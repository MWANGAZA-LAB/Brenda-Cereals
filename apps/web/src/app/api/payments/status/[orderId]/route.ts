import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId } = params;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the order and its payment
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id, // Ensure user can only access their own orders
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const payment = order.payments[0];

    return NextResponse.json({
      orderId: order.id,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      payment: payment ? {
        id: payment.id,
        method: payment.method,
        status: payment.status,
        amount: payment.amount,
        createdAt: payment.createdAt,
        confirmedAt: payment.confirmedAt,
        mpesaCheckoutRequestId: payment.mpesaCheckoutRequestId,
        bitcoinAddress: payment.bitcoinAddress,
        bitcoinAmount: payment.bitcoinAmount,
        bitcoinTxHash: payment.bitcoinTxHash,
      } : null
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
