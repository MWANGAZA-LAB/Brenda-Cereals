import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

interface DeliveryInfo {
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { items, deliveryInfo, paymentMethod, total, deliveryFee }: {
      items: OrderItem[];
      deliveryInfo: DeliveryInfo;
      paymentMethod: 'MPESA' | 'BITCOIN';
      total: number;
      deliveryFee: number;
    } = await request.json();

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!deliveryInfo.phone || !deliveryInfo.address) {
      return NextResponse.json(
        { error: 'Delivery information is required' },
        { status: 400 }
      );
    }

    if (!['MPESA', 'BITCOIN'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Verify total calculation
    if (Math.abs(total - (subtotal + deliveryFee)) > 0.01) {
      return NextResponse.json(
        { error: 'Total calculation mismatch' },
        { status: 400 }
      );
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        email: session.user.email,
        phone: deliveryInfo.phone,
        status: 'PENDING',
        subtotal,
        deliveryFee,
        total,
        deliveryLocation: JSON.stringify(deliveryInfo.location),
        deliveryAddress: JSON.stringify(deliveryInfo),
        paymentMethod,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      },
      include: {
        items: true
      }
    });

    console.log('Order created:', {
      orderId: order.id,
      userId: user.id,
      total: order.total,
      paymentMethod: order.paymentMethod,
      itemCount: order.items.length
    });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items,
      createdAt: order.createdAt
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
