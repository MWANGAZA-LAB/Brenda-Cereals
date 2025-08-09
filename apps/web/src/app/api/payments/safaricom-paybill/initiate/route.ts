import { NextRequest, NextResponse } from 'next/server';
import { safaricomPaybillService } from '@/lib/safaricom-paybill';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, phoneNumber } = body;

    if (!orderId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Order ID and phone number are required' },
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

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        method: 'SAFARICOM_PAYBILL',
        amount: order.total,
        currency: 'KES',
        mpesaPhone: phoneNumber,
        paybillNumber: process.env.SAFARICOM_PAYBILL_NUMBER || '174379',
        accountRef: orderId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }
    });

    // Initiate Safaricom paybill payment
    const paymentResponse = await safaricomPaybillService.initiatePaybillPayment({
      orderId,
      amount: order.total / 100, // Convert from cents to KES
      phoneNumber,
      accountReference: orderId,
      description: `Payment for Brenda Cereals Order ${orderId}`
    });

    if (paymentResponse.success) {
      // Update payment with checkout request ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          mpesaCode: paymentResponse.checkoutRequestId
        }
      });

      // Get paybill instructions
      const instructions = safaricomPaybillService.getPaybillInstructions();

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        checkoutRequestId: paymentResponse.checkoutRequestId,
        merchantRequestId: paymentResponse.merchantRequestId,
        customerMessage: paymentResponse.customerMessage,
        paybillInstructions: instructions,
        message: 'Payment initiated successfully. Please complete the payment using M-Pesa.'
      });
    } else {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED'
        }
      });

      return NextResponse.json({
        success: false,
        error: paymentResponse.errorMessage || 'Failed to initiate payment'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error initiating Safaricom paybill payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
