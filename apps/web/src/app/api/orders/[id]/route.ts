import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

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

    // Find the order with full details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                description: true,
              }
            },
            variant: {
              select: {
                weight: true,
              }
            }
          }
        },
        payments: {
          select: {
            method: true,
            status: true,
            amount: true,
            createdAt: true,
            confirmedAt: true,
            mpesaCode: true,
            mpesaPhone: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action } = await request.json();
    const { id: orderId } = await params;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
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

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    let updatedOrder;

    switch (action) {
      case 'CANCEL':
        if (order.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Only pending orders can be cancelled' },
            { status: 400 }
          );
        }
        
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            // cancelledAt: new Date(), // Field not in schema
          },
          include: {
            items: {
              include: {
                product: true
              }
            },
            payments: true
          }
        });
        break;

      case 'REQUEST_REFUND':
        if (order.status !== 'CONFIRMED' || order.paymentStatus !== 'PAID') {
          return NextResponse.json(
            { error: 'Only confirmed and paid orders can request refunds' },
            { status: 400 }
          );
        }
        
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'REFUND_REQUESTED',
            // refundRequestedAt: new Date(), // Field not in schema
          },
          include: {
            items: {
              include: {
                product: true
              }
            },
            payments: true
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 