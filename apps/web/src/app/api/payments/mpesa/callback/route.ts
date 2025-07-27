import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const mpesaCallback = await request.json()
    
    console.log('MPesa callback received:', JSON.stringify(mpesaCallback, null, 2))

    const stkCallback = mpesaCallback.Body?.stkCallback
    if (!stkCallback) {
      return NextResponse.json({ message: 'Invalid callback format' }, { status: 400 })
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback

    // Mock processing for development
    if (ResultCode === 0) {
      console.log(`Payment completed successfully for checkout request: ${CheckoutRequestID}`)
    } else {
      console.log(`Payment failed for checkout request ${CheckoutRequestID}: ${ResultDesc}`)
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
