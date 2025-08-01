import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { mpesaService } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId, phoneNumber, amount } = await req.json();

    if (!orderId || !phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format (Kenya format)
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    let formattedPhone = cleanPhone;
    
    // Handle different phone number formats
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '254' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) {
      formattedPhone = '254' + cleanPhone;
    } else if (!cleanPhone.startsWith('254')) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use 254XXXXXXXXX, 0XXXXXXXXX, or 7XXXXXXXX' },
        { status: 400 }
      );
    }

    if (formattedPhone.length !== 12) {
      return NextResponse.json(
        { error: 'Invalid phone number length' },
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

    // Initiate M-Pesa payment
    const mpesaResponse = await mpesaService.initiateSTKPush({
      phone: cleanPhone,
      amount: order.total,
      accountReference: `BCS-${order.id.substring(0, 8)}`,
      transactionDesc: `Payment for Order #${order.id.substring(0, 8)}`
    });

    if (mpesaResponse.ResponseCode !== '0') {
      return NextResponse.json(
        { error: 'Failed to initiate M-Pesa payment', details: mpesaResponse.ResponseDescription },
        { status: 500 }
      );
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'MPESA',
        amount: order.total,
        status: 'PENDING',
        mpesaCheckoutRequestId: mpesaResponse.CheckoutRequestID,
        mpesaPhone: cleanPhone,
      }
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: mpesaResponse.CheckoutRequestID,
      message: mpesaResponse.CustomerMessage
    });

  } catch (error) {
    console.error('M-Pesa payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
