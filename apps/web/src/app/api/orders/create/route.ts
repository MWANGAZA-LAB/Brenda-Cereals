import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  weight: string;
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
        status: OrderStatus.PENDING,
        subtotal,
        deliveryFee,
        total,
        deliveryPhone: deliveryInfo.phone,
        deliveryAddress: deliveryInfo.address,
        deliveryLat: deliveryInfo.location.lat,
        deliveryLng: deliveryInfo.location.lng,
        deliveryLocationName: deliveryInfo.location.address,
        paymentMethod,
        items: {
          create: items.map(item => ({
            productName: item.name,
            productImage: item.image,
            weight: item.weight,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
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
