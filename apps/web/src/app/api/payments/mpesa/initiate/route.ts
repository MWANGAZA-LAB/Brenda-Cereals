import { NextRequest, NextResponse } from 'next/server'
import { mpesaService } from '@/lib/mpesa'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, orderId } = await request.json()

    // Validate required fields
    if (!phoneNumber || !amount || !orderId) {
      return NextResponse.json(
        { message: 'Phone number, amount, and order ID are required' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Order is not pending payment' },
        { status: 400 }
      )
    }

    // Initiate STK push
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payments/mpesa/callback`
    const accountReference = `ORDER-${orderId}`
    const transactionDesc = `Payment for Brenda Cereals Order ${orderId}`

    const stkResponse = await mpesaService.initiateSTKPush(
      phoneNumber,
      Math.round(amount),
      accountReference,
      transactionDesc,
      callbackUrl
    )

    // Store payment request details
    await prisma.payment.create({
      data: {
        orderId,
        method: 'MPESA',
        amount: amount,
        status: 'PENDING',
        externalId: stkResponse.CheckoutRequestID,
        metadata: {
          merchantRequestId: stkResponse.MerchantRequestID,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          phoneNumber: phoneNumber
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: stkResponse.CustomerMessage,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID
    })

  } catch (error) {
    console.error('MPesa payment initiation error:', error)
    return NextResponse.json(
      { message: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
