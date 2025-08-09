import { NextRequest, NextResponse } from 'next/server';
import { bitcoinWalletService } from '@/lib/bitcoin-wallet';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create Bitcoin wallet payment request
    const paymentRequest = await bitcoinWalletService.createPaymentRequest({
      orderId,
      amount: order.total / 100, // Convert from cents to USD
      currency: 'USD'
    });

    if (paymentRequest.success) {
      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          orderId,
          method: 'BITCOIN_WALLET',
          amount: order.total,
          currency: 'USD',
          paybillConfirmation: paymentRequest.walletAddress,
          paybillReference: paymentRequest.btcAmount,
          expiresAt: paymentRequest.expiresAt
        }
      });

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        walletAddress: paymentRequest.walletAddress,
        btcAmount: paymentRequest.btcAmount,
        qrCodeImage: paymentRequest.qrCodeImage,
        paymentUri: paymentRequest.paymentUri,
        expiresAt: paymentRequest.expiresAt,
        instructions: bitcoinWalletService.getPaymentInstructions(),
        formattedAmount: bitcoinWalletService.formatBitcoinAmount(paymentRequest.btcAmount)
      });
    } else {
      return NextResponse.json({
        success: false,
        error: paymentRequest.errorMessage || 'Failed to create Bitcoin payment request'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating Bitcoin wallet payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
