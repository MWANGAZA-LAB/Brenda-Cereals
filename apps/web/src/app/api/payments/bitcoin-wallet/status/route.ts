import { NextRequest, NextResponse } from 'next/server';
import { bitcoinWalletService } from '@/lib/bitcoin-wallet';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true
      }
    });

    if (!payment || payment.method !== 'BITCOIN_WALLET') {
      return NextResponse.json(
        { error: 'Bitcoin wallet payment not found' },
        { status: 404 }
      );
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        confirmed: true,
        confirmations: 6, // Assume confirmed if already marked as completed
        message: 'Payment already confirmed'
      });
    }

    // Check payment status on blockchain
    const walletAddress = payment.paybillConfirmation; // We stored the address here
    const expectedAmount = payment.paybillReference; // We stored the BTC amount here

    if (!walletAddress || !expectedAmount) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      );
    }

    const status = await bitcoinWalletService.checkPaymentStatus(walletAddress, expectedAmount);

    if (status.confirmed && status.confirmations >= 1) {
      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          confirmedAt: new Date()
        }
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID'
        }
      });

      return NextResponse.json({
        success: true,
        status: 'completed',
        confirmed: true,
        confirmations: status.confirmations,
        txHash: status.txHash,
        message: 'Payment confirmed successfully'
      });
    } else {
      return NextResponse.json({
        success: true,
        status: 'pending',
        confirmed: false,
        confirmations: status.confirmations,
        message: 'Payment not yet confirmed'
      });
    }
  } catch (error) {
    console.error('Error checking Bitcoin wallet payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
