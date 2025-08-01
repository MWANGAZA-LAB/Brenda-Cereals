import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { deliveryLocation: { contains: search } }
      ];
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                  weight: true,
                }
              }
            }
          },
          payment: {
            select: {
              method: true,
              status: true,
              amount: true,
              createdAt: true,
              confirmedAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { orderIds, action, status, notes } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs are required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let results = [];

    switch (action) {
      case 'UPDATE_STATUS':
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required for update action' },
            { status: 400 }
          );
        }

        updateData = { status };
        
        // Add specific timestamps based on status
        if (status === 'CONFIRMED') {
          updateData.confirmedAt = new Date();
        } else if (status === 'SHIPPED') {
          updateData.shippedAt = new Date();
        } else if (status === 'DELIVERED') {
          updateData.deliveredAt = new Date();
        } else if (status === 'CANCELLED') {
          updateData.cancelledAt = new Date();
        }

        if (notes) {
          updateData.adminNotes = notes;
        }

        for (const orderId of orderIds) {
          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          });
          results.push(updatedOrder);
        }
        break;

      case 'ADD_NOTES':
        if (!notes) {
          return NextResponse.json(
            { error: 'Notes are required for add notes action' },
            { status: 400 }
          );
        }

        for (const orderId of orderIds) {
          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { 
              adminNotes: notes,
              updatedAt: new Date()
            }
          });
          results.push(updatedOrder);
        }
        break;

      case 'REFUND':
        for (const orderId of orderIds) {
          const order = await prisma.order.findUnique({
            where: { id: orderId }
          });

          if (!order) {
            continue;
          }

          if (order.paymentStatus !== 'PAID') {
            return NextResponse.json(
              { error: `Order ${orderId} is not paid and cannot be refunded` },
              { status: 400 }
            );
          }

          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'REFUNDED',
              paymentStatus: 'REFUNDED',
              refundedAt: new Date(),
              adminNotes: notes || 'Refund processed by admin'
            }
          });
          results.push(updatedOrder);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed for ${results.length} orders`,
      orders: results,
    });

  } catch (error) {
    console.error('Error updating orders:', error);
    return NextResponse.json(
      { error: 'Failed to update orders' },
      { status: 500 }
    );
  }
}
