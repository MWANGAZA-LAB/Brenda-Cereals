import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentMethod } = await request.json()

    // Validate required fields
    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { message: 'Order ID and payment method are required' },
        { status: 400 }
      )
    }

    if (!['bitcoin', 'lightning'].includes(paymentMethod)) {
      return NextResponse.json(
        { message: 'Invalid payment method. Use "bitcoin" or "lightning"' },
        { status: 400 }
      )
    }

    // Mock response for development
    const mockResponse: any = {
      success: true,
      paymentMethod: paymentMethod,
      amountKES: 1500, // Mock amount
      amountSats: 150000, // Mock satoshis
      paymentId: `mock-payment-${Date.now()}`,
      message: `Bitcoin ${paymentMethod} payment initiated successfully`
    }

    if (paymentMethod === 'lightning') {
      mockResponse.paymentRequest = 'lnbc150000n1p...' // Mock Lightning invoice
      mockResponse.expiresAt = new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    } else {
      mockResponse.paymentURI = 'bitcoin:bc1q...' // Mock Bitcoin address
      mockResponse.walletAddress = 'bc1q...' // Mock wallet address
    }

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('Bitcoin payment initiation error:', error)
    return NextResponse.json(
      { message: 'Failed to initiate Bitcoin payment' },
      { status: 500 }
    )
  }
}
