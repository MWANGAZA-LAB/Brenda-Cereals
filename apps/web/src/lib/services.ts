import prisma from '@/lib/prisma'

// Product Services
export const productService = {
  async getAll() {
    return await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
  },

  async getById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    })
  },

  async getByCategory(categoryId: string) {
    return await prisma.product.findMany({
      where: { 
        categoryId,
        isActive: true 
      },
      include: {
        category: true
      }
    })
  },

  async search(query: string) {
    return await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      }
    })
  }
}

// User Services
export const userService = {
  async create(data: {
    email: string
    name?: string
    phone?: string
    hashedPassword: string
  }) {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        // Note: In real implementation, you'd handle password hashing
      }
    })
  },

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        addresses: true
      }
    })
  },

  async updateProfile(userId: string, data: {
    name?: string
    phone?: string
    avatar?: string
  }) {
    return await prisma.user.update({
      where: { id: userId },
      data
    })
  }
}

// Cart Services
export const cartService = {
  async getCart(userId: string) {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true
      }
    })
  },

  async addToCart(userId: string, productId: string, quantity: number) {
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId }
    })

    if (existingItem) {
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
    }

    return await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity
      }
    })
  },

  async updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return await prisma.cartItem.delete({
        where: { id: cartItemId }
      })
    }

    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    })
  },

  async clearCart(userId: string) {
    return await prisma.cartItem.deleteMany({
      where: { userId }
    })
  }
}

// Order Services
export const orderService = {
  async create(userId: string, orderData: {
    total: number
    shippingAddress: any
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
  }) {
    return await prisma.order.create({
      data: {
        userId,
        total: orderData.total,
        status: 'PENDING',
        shippingAddress: orderData.shippingAddress,
        items: {
          create: orderData.items.map(item => ({
            productId: item.productId,
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
    })
  },

  async getUserOrders(userId: string) {
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
    })
  },

  async updateStatus(orderId: string, status: string) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })
  }
}
