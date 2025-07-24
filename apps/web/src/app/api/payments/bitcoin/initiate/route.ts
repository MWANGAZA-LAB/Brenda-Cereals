import { NextRequest, NextResponse } from 'next/server'
import { bitcoinService } from '@/lib/bitcoin'
import prisma from '@/lib/prisma'

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

    const amountKES = order.total
    const description = `Brenda Cereals Order ${orderId}`

    if (paymentMethod === 'lightning') {
      // Create Lightning invoice
      const amountSats = await bitcoinService.convertToSatoshis(amountKES, 'KES')
      const invoice = await bitcoinService.createLightningInvoice(
        amountSats,
        description,
        3600 // 1 hour expiry
      )

      // Store payment request
      const payment = await prisma.payment.create({
        data: {
          orderId,
          method: 'LIGHTNING',
          amount: amountKES,
          status: 'PENDING',
          externalId: invoice.payment_hash,
          metadata: {
            paymentRequest: invoice.payment_request,
            amountSats: amountSats,
            expiresAt: invoice.expires_at
          }
        }
      })

      return NextResponse.json({
        success: true,
        paymentMethod: 'lightning',
        paymentRequest: invoice.payment_request,
        amountSats: amountSats,
        amountKES: amountKES,
        expiresAt: invoice.expires_at,
        paymentId: payment.id
      })

    } else {
      // Create Bitcoin on-chain payment
      const amountSats = await bitcoinService.convertToSatoshis(amountKES, 'KES')
      const paymentURI = bitcoinService.generateBitcoinPaymentURI(
        amountSats,
        'Brenda Cereals',
        description
      )

      // Store payment request
      const payment = await prisma.payment.create({
        data: {
          orderId,
          method: 'BITCOIN',
          amount: amountKES,
          status: 'PENDING',
          metadata: {
            paymentURI: paymentURI,
            amountSats: amountSats,
            walletAddress: process.env.BITCOIN_WALLET_ADDRESS
          }
        }
      })

      return NextResponse.json({
        success: true,
        paymentMethod: 'bitcoin',
        paymentURI: paymentURI,
        walletAddress: process.env.BITCOIN_WALLET_ADDRESS,
        amountSats: amountSats,
        amountKES: amountKES,
        paymentId: payment.id
      })
    }

  } catch (error) {
    console.error('Bitcoin payment initiation error:', error)
    return NextResponse.json(
      { message: 'Failed to initiate Bitcoin payment' },
      { status: 500 }
    )
  }
}
