/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET as getOrders } from '@/app/api/orders/route';
import { GET as getUserProfile, PATCH as updateUserProfile } from '@/app/api/user/profile/route';
import { GET as getProducts } from '@/app/api/products/route';
// Mock NextAuth
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));
// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        order: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            groupBy: jest.fn(),
            aggregate: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
        },
        orderItem: {
            groupBy: jest.fn(),
        },
        payment: {
            groupBy: jest.fn(),
            create: jest.fn(),
        },
        $queryRaw: jest.fn(),
    },
}));
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
const mockGetServerSession = getServerSession;
describe('Enhanced API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Orders API', () => {
        it('should require authentication for GET /api/orders', async () => {
            mockGetServerSession.mockResolvedValue(null);
            const request = new NextRequest('http://localhost:3000/api/orders');
            const response = await getOrders(request);
            const data = await response.json();
            expect(response.status).toBe(401);
            expect(data.error).toBe('Authentication required');
        });
        it('should fetch user orders when authenticated', async () => {
            const mockSession = {
                user: { email: 'test@example.com' },
                expires: new Date().toISOString(),
            };
            const mockUser = { id: 'user1', email: 'test@example.com' };
            const mockOrders = [
                {
                    id: 'order1',
                    total: 500,
                    status: 'PENDING',
                    orderItems: [],
                    payment: null,
                },
            ];
            mockGetServerSession.mockResolvedValue(mockSession);
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.order.findMany.mockResolvedValue(mockOrders);
            prisma.order.count.mockResolvedValue(1);
            const request = new NextRequest('http://localhost:3000/api/orders');
            const response = await getOrders(request);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.orders).toEqual(mockOrders);
        });
    });
    describe('User Profile API', () => {
        it('should fetch user profile with statistics', async () => {
            const mockSession = {
                user: { email: 'test@example.com' },
                expires: new Date().toISOString(),
            };
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                phone: '254700000000',
                orders: [],
            };
            const mockStats = [
                { status: 'COMPLETED', _count: { id: 2 }, _sum: { total: 1000 } },
            ];
            mockGetServerSession.mockResolvedValue(mockSession);
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.order.groupBy.mockResolvedValue(mockStats);
            const request = new NextRequest('http://localhost:3000/api/user/profile');
            const response = await getUserProfile(request);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.user.email).toBe('test@example.com');
            expect(data.stats.totalOrders).toBe(2);
        });
        it('should update user profile', async () => {
            const mockSession = {
                user: { email: 'test@example.com' },
                expires: new Date().toISOString(),
            };
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedpassword',
            };
            const mockUpdatedUser = {
                id: 'user1',
                email: 'test@example.com',
                name: 'Updated User',
                phone: '254700000001',
            };
            mockGetServerSession.mockResolvedValue(mockSession);
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.user.update.mockResolvedValue(mockUpdatedUser);
            const requestBody = {
                name: 'Updated User',
                phone: '254700000001',
            };
            const request = new NextRequest('http://localhost:3000/api/user/profile', {
                method: 'PATCH',
                body: JSON.stringify(requestBody),
            });
            const response = await updateUserProfile(request);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.user.name).toBe('Updated User');
        });
    });
    describe('Products API', () => {
        it('should fetch products with pagination', async () => {
            const mockProducts = [
                { id: 'product1', name: 'White Maize', price: 150, inStock: true },
                { id: 'product2', name: 'Yellow Maize', price: 140, inStock: true },
            ];
            prisma.product.findMany.mockResolvedValue(mockProducts);
            prisma.product.count.mockResolvedValue(2);
            const request = new NextRequest('http://localhost:3000/api/products?page=1&limit=10');
            const response = await getProducts(request);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.products).toEqual(mockProducts);
            expect(data.pagination.totalCount).toBe(2);
        });
        it('should filter products by search term', async () => {
            const mockProducts = [
                { id: 'product1', name: 'White Maize', price: 150, inStock: true },
            ];
            prisma.product.findMany.mockResolvedValue(mockProducts);
            prisma.product.count.mockResolvedValue(1);
            const request = new NextRequest('http://localhost:3000/api/products?search=white');
            const response = await getProducts(request);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.products).toEqual(mockProducts);
        });
    });
});
