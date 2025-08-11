import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        // Get date range for analytics
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Fetch dashboard analytics
        const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders, ordersByStatus, revenueByDay, topProducts, paymentMethods] = await Promise.all([
            // Total orders
            prisma.order.count(),
            // Total revenue
            prisma.order.aggregate({
                _sum: { total: true },
                where: { paymentStatus: 'PAID' }
            }),
            // Total users
            prisma.user.count(),
            // Total products
            prisma.product.count(),
            // Recent orders
            prisma.order.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true }
                    },
                    items: {
                        include: {
                            product: {
                                select: { name: true }
                            }
                        }
                    }
                }
            }),
            // Orders by status
            prisma.order.groupBy({
                by: ['status'],
                _count: { id: true },
                _sum: { total: true }
            }),
            // Revenue by day (last 30 days)
            prisma.$queryRaw `
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as orders,
          SUM(total) as revenue
        FROM Order 
        WHERE createdAt >= ${startDate}
          AND paymentStatus = 'PAID'
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
      `,
            // Top selling products
            prisma.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true, price: true },
                _count: { id: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            }),
            // Payment methods distribution
            prisma.payment.groupBy({
                by: ['method'],
                _count: { id: true },
                _sum: { amount: true },
                where: { status: 'COMPLETED' }
            })
        ]);
        // Get product details for top products
        const topProductsWithDetails = await Promise.all(topProducts.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true, image: true }
            });
            return {
                ...product,
                totalSold: item._sum.quantity,
                totalRevenue: (item._sum.price || 0) * (item._sum.quantity || 0),
                orderCount: item._count.id
            };
        }));
        // Format dashboard data
        const dashboardData = {
            overview: {
                totalOrders,
                totalRevenue: totalRevenue._sum.total || 0,
                totalUsers,
                totalProducts,
                averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0
            },
            charts: {
                ordersByStatus: ordersByStatus.map((item) => ({
                    status: item.status,
                    count: item._count.id,
                    revenue: item._sum.total || 0
                })),
                revenueByDay,
                paymentMethods: paymentMethods.map((item) => ({
                    method: item.method,
                    count: item._count.id,
                    amount: item._sum.amount || 0
                }))
            },
            topProducts: topProductsWithDetails,
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                customerName: order.user.name,
                customerEmail: order.user.email,
                items: order.items.length,
                total: order.total,
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt
            }))
        };
        return NextResponse.json({
            success: true,
            data: dashboardData
        });
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
