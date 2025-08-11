/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/orders/create/route';
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
        },
        order: {
            create: jest.fn(),
        },
    },
}));
const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
};
const mockOrder = {
    id: 'order-123',
    userId: 'user-1',
    status: 'PENDING',
    total: 500,
    subtotal: 300,
    deliveryFee: 200,
    paymentMethod: 'MPESA',
    items: [
        {
            id: 'item-1',
            productName: 'White Maize',
            quantity: 2,
            unitPrice: 150,
            totalPrice: 300,
        },
    ],
    createdAt: new Date(),
};
describe('API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/orders/create', () => {
        it('creates order successfully with valid data', async () => {
            const mockGetServerSession = require('next-auth').getServerSession;
            const mockPrisma = require('@/lib/prisma').default;
            mockGetServerSession.mockResolvedValue({
                user: { email: 'test@example.com' },
            });
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.order.create.mockResolvedValue(mockOrder);
            const requestBody = {
                items: [
                    {
                        id: '1',
                        name: 'White Maize',
                        image: '/maize-product.jpg',
                        weight: '1kg',
                        quantity: 2,
                        price: 150,
                    },
                ],
                deliveryInfo: {
                    phone: '254712345678',
                    address: '123 Test Street, Nairobi',
                    location: {
                        lat: -1.2921,
                        lng: 36.8219,
                        address: 'Nairobi, Kenya',
                    },
                },
                paymentMethod: 'MPESA',
                total: 500,
                deliveryFee: 200,
            };
            const request = new NextRequest('http://localhost:3000/api/orders/create', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await POST(request);
            const responseData = await response.json();
            expect(response.status).toBe(200);
            expect(responseData).toMatchObject({
                id: 'order-123',
                status: 'PENDING',
                total: 500,
                paymentMethod: 'MPESA',
            });
            expect(mockPrisma.order.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'user-1',
                    status: 'PENDING',
                    total: 500,
                    subtotal: 300,
                    deliveryFee: 200,
                    paymentMethod: 'MPESA',
                    deliveryPhone: '254712345678',
                    deliveryAddress: '123 Test Street, Nairobi',
                }),
                include: { items: true },
            });
        });
        it('returns 401 for unauthenticated requests', async () => {
            const mockGetServerSession = require('next-auth').getServerSession;
            mockGetServerSession.mockResolvedValue(null);
            const request = new NextRequest('http://localhost:3000/api/orders/create', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await POST(request);
            const responseData = await response.json();
            expect(response.status).toBe(401);
            expect(responseData.error).toBe('Authentication required');
        });
        it('validates required fields', async () => {
            const mockGetServerSession = require('next-auth').getServerSession;
            const mockPrisma = require('@/lib/prisma').default;
            mockGetServerSession.mockResolvedValue({
                user: { email: 'test@example.com' },
            });
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            const requestBody = {
                items: [], // Empty items array
                deliveryInfo: {
                    phone: '254712345678',
                    address: '123 Test Street, Nairobi',
                    location: {
                        lat: -1.2921,
                        lng: 36.8219,
                        address: 'Nairobi, Kenya',
                    },
                },
                paymentMethod: 'MPESA',
                total: 500,
                deliveryFee: 200,
            };
            const request = new NextRequest('http://localhost:3000/api/orders/create', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await POST(request);
            const responseData = await response.json();
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Order must contain at least one item');
        });
        it('validates delivery information', async () => {
            const mockGetServerSession = require('next-auth').getServerSession;
            const mockPrisma = require('@/lib/prisma').default;
            mockGetServerSession.mockResolvedValue({
                user: { email: 'test@example.com' },
            });
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            const requestBody = {
                items: [
                    {
                        id: '1',
                        name: 'White Maize',
                        image: '/maize-product.jpg',
                        weight: '1kg',
                        quantity: 2,
                        price: 150,
                    },
                ],
                deliveryInfo: {
                    phone: '', // Missing phone
                    address: '', // Missing address
                    location: {
                        lat: -1.2921,
                        lng: 36.8219,
                        address: 'Nairobi, Kenya',
                    },
                },
                paymentMethod: 'MPESA',
                total: 500,
                deliveryFee: 200,
            };
            const request = new NextRequest('http://localhost:3000/api/orders/create', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await POST(request);
            const responseData = await response.json();
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Delivery information is required');
        });
        it('validates payment method', async () => {
            const mockGetServerSession = require('next-auth').getServerSession;
            const mockPrisma = require('@/lib/prisma').default;
            mockGetServerSession.mockResolvedValue({
                user: { email: 'test@example.com' },
            });
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            const requestBody = {
                items: [
                    {
                        id: '1',
                        name: 'White Maize',
                        image: '/maize-product.jpg',
                        weight: '1kg',
                        quantity: 2,
                        price: 150,
                    },
                ],
                deliveryInfo: {
                    phone: '254712345678',
                    address: '123 Test Street, Nairobi',
                    location: {
                        lat: -1.2921,
                        lng: 36.8219,
                        address: 'Nairobi, Kenya',
                    },
                },
                paymentMethod: 'INVALID_METHOD', // Invalid payment method
                total: 500,
                deliveryFee: 200,
            };
            const request = new NextRequest('http://localhost:3000/api/orders/create', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await POST(request);
            const responseData = await response.json();
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Invalid payment method');
        });
        it('validates total calculation', async () => {
            const mockGetServerSession = require('next-auth').getServerSession;
            const mockPrisma = require('@/lib/prisma').default;
            mockGetServerSession.mockResolvedValue({
                user: { email: 'test@example.com' },
            });
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            const requestBody = {
                items: [
                    {
                        id: '1',
                        name: 'White Maize',
                        image: '/maize-product.jpg',
                        weight: '1kg',
                        quantity: 2,
                        price: 150,
                    },
                ],
                deliveryInfo: {
                    phone: '254712345678',
                    address: '123 Test Street, Nairobi',
                    location: {
                        lat: -1.2921,
                        lng: 36.8219,
                        address: 'Nairobi, Kenya',
                    },
                },
                paymentMethod: 'MPESA',
                total: 999, // Wrong total (should be 500)
                deliveryFee: 200,
            };
            const request = new NextRequest('http://localhost:3000/api/orders/create', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await POST(request);
            const responseData = await response.json();
            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Total calculation mismatch');
        });
        it('handles user not found', async () => {
            const mockGetServerSession = require('next-auth').getServerSession;
            const mockPrisma = require('@/lib/prisma').default;
            mockGetServerSession.mockResolvedValue({
                user: { email: 'nonexistent@example.com' },
            });
            mockPrisma.user.findUnique.mockResolvedValue(null);
            const requestBody = {
                items: [
                    {
                        id: '1',
                        name: 'White Maize',
                        image: '/maize-product.jpg',
                        weight: '1kg',
                        quantity: 2,
                        price: 150,
                    },
                ],
                deliveryInfo: {
                    phone: '254712345678',
                    address: '123 Test Street, Nairobi',
                    location: {
                        lat: -1.2921,
                        lng: 36.8219,
                        address: 'Nairobi, Kenya',
                    },
                },
                paymentMethod: 'MPESA',
                total: 500,
                deliveryFee: 200,
            };
            const request = new NextRequest('http://localhost:3000/api/orders/create', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await POST(request);
            const responseData = await response.json();
            expect(response.status).toBe(404);
            expect(responseData.error).toBe('User not found');
        });
    });
});
