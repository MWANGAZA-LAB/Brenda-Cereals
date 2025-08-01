import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      confirmedAt: payment.confirmedAt,
      expiresAt: payment.expiresAt,
      order: {
        id: payment.order.id,
        status: payment.order.status,
        paymentStatus: payment.order.paymentStatus,
      },
      ...(payment.method === 'MPESA' && {
        mpesaCode: payment.mpesaCode,
        paybillNumber: payment.paybillNumber,
        accountRef: payment.accountRef,
      }),
      ...(payment.method === 'BITCOIN' && {
        bitcoinAddress: payment.bitcoinAddress,
        bitcoinAmount: payment.bitcoinAmount,
        bitcoinTxHash: payment.bitcoinTxHash,
        qrCodeData: payment.qrCodeData,
      }),
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
