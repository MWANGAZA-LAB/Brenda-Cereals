import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Brenda Cereals data...');

  // Clear existing data in correct order
  await prisma.paymentWebhook.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        id: 'maize-white',
        name: 'Maize (White)',
        description: 'Premium quality white maize from Kenyan highlands. Perfect for ugali and other traditional dishes.',
        image: '/maize-product.jpg',
        category: 'GRAINS',
        prices: {
          '1kg': 120,
          '5kg': 550,
          '10kg': 1100,
          '25kg': 2650,
          '50kg': 5000
        },
        stock: 500,
        inStock: true,
      },
    }),
    prisma.product.create({
      data: {
        id: 'beans-rosecoco',
        name: 'Beans (Rosecoco)',
        description: 'High-quality rosecoco beans rich in protein and nutrients. Locally sourced from Kenyan farmers.',
        image: '/beans-product.jpg',
        category: 'LEGUMES',
        prices: {
          '1kg': 180,
          '5kg': 850,
          '10kg': 1650,
          '25kg': 4000,
          '50kg': 8000
        },
        stock: 300,
        inStock: true,
      },
    }),
    prisma.product.create({
      data: {
        id: 'rice-pishori',
        name: 'Rice (Pishori)',
        description: 'Aromatic Pishori rice with excellent taste and texture. Grown in Mwea irrigation scheme.',
        image: '/rice-product.jpg',
        category: 'GRAINS',
        prices: {
          '1kg': 250,
          '5kg': 1200,
          '10kg': 2300,
          '25kg': 5500,
          '50kg': 11000
        },
        stock: 150,
        inStock: true,
      },
    }),
    prisma.product.create({
      data: {
        id: 'millet-finger',
        name: 'Millet (Finger)',
        description: 'Nutritious finger millet packed with minerals and vitamins. Great for porridge and traditional foods.',
        image: '/millet.png',
        category: 'GRAINS',
        prices: {
          '1kg': 200,
          '5kg': 950,
          '10kg': 1850,
          '25kg': 4500,
          '50kg': 9000
        },
        stock: 100,
        inStock: true,
      },
    }),
    prisma.product.create({
      data: {
        id: 'sorghum-red',
        name: 'Sorghum (Red)',
        description: 'Drought-resistant red sorghum with high nutritional value. Perfect for traditional meals and brewing.',
        image: '/sorghum.png',
        category: 'GRAINS',
        prices: {
          '1kg': 160,
          '5kg': 750,
          '10kg': 1450,
          '25kg': 3500,
          '50kg': 7000
        },
        stock: 200,
        inStock: true,
      },
    }),
  ]);

  // Create admin user with password
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-user',
      email: 'admin@brendacereals.com',
      name: 'Brenda Cereals Admin',
      phone: '+254700000000',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      emailVerified: new Date(),
    },
  });

  // Create sample customer with password
  const customerPassword = await bcrypt.hash('password123', 12);
  const customer = await prisma.user.create({
    data: {
      id: 'customer-sample',
      email: 'customer@example.com',
      name: 'John Doe',
      phone: '+254712345678',
      password: customerPassword,
      role: 'CUSTOMER',
      isVerified: true,
      emailVerified: new Date(),
      address: 'Nairobi, Kenya',
    },
  });

  // Create sample order
  const order = await prisma.order.create({
    data: {
      id: 'order-sample-001',
      userId: customer.id,
      totalAmount: 1270, // 1kg maize + 5kg beans
      deliveryAddress: 'Westlands, Nairobi',
      deliveryFee: 200,
      deliveryLocation: {
        lat: -1.2667,
        lng: 36.8167,
        address: 'Westlands, Nairobi'
      },
      status: 'PENDING',
      paymentMethod: 'MPESA',
    },
  });

  // Create order items
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: products[0].id, // Maize
        quantity: 1,
        weight: '1kg',
        price: 120,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: products[1].id, // Beans
        quantity: 1,
        weight: '5kg',
        price: 850,
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${products.length} products`);
  console.log(`Created 2 users (admin & customer)`);
  console.log(`Created 1 sample order with 2 items`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
