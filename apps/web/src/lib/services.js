import prisma from '@/lib/prisma';
// Product Services
export const productService = {
    async getAll() {
        return await prisma.product.findMany({
            where: { inStock: true },
            orderBy: { createdAt: 'desc' }
        });
    },
    async getById(id) {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                category: true
            }
        });
    },
    async getByCategory(categoryId) {
        return await prisma.product.findMany({
            where: {
                categoryId,
                inStock: true
            },
            include: {
                category: true
            }
        });
    },
    async search(query) {
        return await prisma.product.findMany({
            where: {
                AND: [
                    { inStock: true },
                    {
                        OR: [
                            { name: { contains: query } },
                            { description: { contains: query } }
                        ]
                    }
                ]
            }
        });
    }
};
// User Services
export const userService = {
    async create(data) {
        return await prisma.user.create({
            data: {
                email: data.email,
                name: data.name || null,
                phone: data.phone || null,
                // Note: In real implementation, you'd handle password hashing
            }
        });
    },
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
            include: {
                addresses: true
            }
        });
    },
    async updateProfile(userId, data) {
        return await prisma.user.update({
            where: { id: userId },
            data
        });
    }
};
// Cart Services
export const cartService = {
    async getCart(userId) {
        return await prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: true
            }
        });
    },
    async addToCart(userId, productId, variantId, quantity) {
        const existingItem = await prisma.cartItem.findFirst({
            where: { userId, variantId }
        });
        if (existingItem) {
            return await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        }
        return await prisma.cartItem.create({
            data: {
                userId,
                productId,
                variantId,
                quantity
            }
        });
    },
    async updateQuantity(cartItemId, quantity) {
        if (quantity <= 0) {
            return await prisma.cartItem.delete({
                where: { id: cartItemId }
            });
        }
        return await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity }
        });
    },
    async clearCart(userId) {
        return await prisma.cartItem.deleteMany({
            where: { userId }
        });
    }
};
// Order Services
export const orderService = {
    async create(userId, orderData) {
        return await prisma.order.create({
            data: {
                userId,
                email: orderData.email,
                total: orderData.total,
                subtotal: orderData.subtotal,
                status: 'PENDING',
                deliveryAddress: orderData.deliveryAddress,
                deliveryLocation: orderData.deliveryLocation,
                paymentMethod: orderData.paymentMethod,
                items: {
                    create: orderData.items.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    },
    async getUserOrders(userId) {
        return await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    },
    async updateStatus(orderId, status) {
        return await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });
    }
};
