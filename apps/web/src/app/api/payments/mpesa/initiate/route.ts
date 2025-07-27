import { NextRequest, NextResponse } from 'next/server'

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

    // Mock response for development
    const mockResponse = {
      success: true,
      message: 'Please check your phone and enter M-Pesa PIN to complete payment',
      checkoutRequestId: `mock-${Date.now()}`,
      merchantRequestId: `mock-merchant-${Date.now()}`
    }

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('MPesa payment initiation error:', error)
    return NextResponse.json(
      { message: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
