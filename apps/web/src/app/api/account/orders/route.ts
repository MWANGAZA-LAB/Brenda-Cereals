import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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

    // Fetch user's orders
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      paymentMethod: order.paymentMethod,
      deliveryPhone: order.deliveryPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryLocationName: order.deliveryLocationName,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      items: order.items.map((item: any) => ({
        productName: item.productName,
        productImage: item.productImage,
        weight: item.weight,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      payment: order.payments[0] ? {
        id: order.payments[0].id,
        method: order.payments[0].method,
        status: order.payments[0].status,
        amount: order.payments[0].amount,
        createdAt: order.payments[0].createdAt,
        confirmedAt: order.payments[0].confirmedAt,
      } : null
    }));

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
