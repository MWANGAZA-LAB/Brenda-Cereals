import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const mpesaCallback = await request.json()
    
    console.log('MPesa callback received:', JSON.stringify(mpesaCallback, null, 2))

    const stkCallback = mpesaCallback.Body?.stkCallback
    if (!stkCallback) {
      return NextResponse.json({ message: 'Invalid callback format' }, { status: 400 })
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        externalId: CheckoutRequestID,
        method: 'MPESA'
      },
      include: {
        order: true
      }
    })

    if (!payment) {
      console.error('Payment not found for CheckoutRequestID:', CheckoutRequestID)
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }

    // Process the callback
    if (ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || []
      const transactionData: any = {}
      
      callbackMetadata.forEach((item: any) => {
        switch (item.Name) {
          case 'Amount':
            transactionData.amount = item.Value
            break
          case 'MpesaReceiptNumber':
            transactionData.mpesaReceiptNumber = item.Value
            break
          case 'TransactionDate':
            transactionData.transactionDate = item.Value
            break
          case 'PhoneNumber':
            transactionData.phoneNumber = item.Value
            break
        }
      })

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          metadata: {
            ...payment.metadata,
            ...transactionData,
            resultCode: ResultCode,
            resultDesc: ResultDesc
          }
        }
      })

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      })

      console.log(`Payment completed successfully for order ${payment.orderId}`)
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: {
            ...payment.metadata,
            resultCode: ResultCode,
            resultDesc: ResultDesc
          }
        }
      })

      console.log(`Payment failed for order ${payment.orderId}: ${ResultDesc}`)
    }

    return NextResponse.json({ message: 'Callback processed successfully' })

  } catch (error) {
    console.error('MPesa callback processing error:', error)
    return NextResponse.json(
      { message: 'Failed to process callback' },
      { status: 500 }
    )
  }
}
