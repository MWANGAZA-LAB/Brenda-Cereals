import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mpesaService } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    const callbackData = await req.json();
    
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    // Log webhook for audit
    await prisma.paymentWebhook.create({
      data: {
        provider: 'mpesa',
        eventType: 'payment_callback',
        payload: callbackData,
      },
    });

    // Process the callback
    const result = mpesaService.processCallback(callbackData);

    if (result.isSuccessful && result.transactionId) {
      // Find the payment record
      const payment = await prisma.payment.findFirst({
        where: {
          mpesaCode: result.transactionId,
          status: 'PENDING',
        },
        include: { order: true },
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            confirmedAt: new Date(),
            metadata: {
              mpesaReceiptNumber: result.mpesaReceiptNumber,
              amount: result.amount,
              phone: result.phone,
            },
          },
        });

        // Update order status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            paidAt: new Date(),
            paymentId: result.mpesaReceiptNumber,
          },
        });

        console.log(`Payment confirmed for order ${payment.orderId}`);
      }
    }

    // Update webhook as processed
    await prisma.paymentWebhook.updateMany({
      where: {
        provider: 'mpesa',
        processed: false,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
