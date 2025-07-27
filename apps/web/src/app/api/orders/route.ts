import { NextRequest, NextResponse } from 'next/server';

let orders = [
  {
    id: 'order1',
    items: [
      { productId: 'maize', name: 'Maize (White)', weight: '5kg', price: 550, qty: 2 },
    ],
    total: 1100,
    deliveryLocation: 'Nairobi',
    deliveryFee: 300,
    paymentMethod: 'mpesa',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { items, total, deliveryLocation, deliveryFee, paymentMethod } = await request.json();
  const newOrder = {
    id: `order${orders.length + 1}`,
    items,
    total,
    deliveryLocation,
    deliveryFee,
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  return NextResponse.json(newOrder, { status: 201 });
} 