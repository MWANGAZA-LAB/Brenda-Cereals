import { NextRequest, NextResponse } from 'next/server';
import { safaricomPaybillService } from '@/lib/safaricom-paybill';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, phoneNumber, confirmationCode } = body;

    if (!orderId || !phoneNumber || !confirmationCode) {
      return NextResponse.json(
        { error: 'Order ID, phone number, and confirmation code are required' },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        method: 'SAFARICOM_PAYBILL',
        status: 'PENDING'
      },
      include: {
        order: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found or already processed' },
        { status: 404 }
      );
    }

    // Confirm payment with Safaricom
    const confirmationResponse = await safaricomPaybillService.confirmPaybillPayment({
      phoneNumber,
      confirmationCode,
      orderId
    });

    if (confirmationResponse.success) {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paybillConfirmation: confirmationCode,
          confirmedAt: new Date()
        }
      });

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed successfully',
        orderId,
        paymentId: payment.id
      });
    } else {
      return NextResponse.json({
        success: false,
        error: confirmationResponse.message || 'Invalid confirmation code'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error confirming Safaricom paybill payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
