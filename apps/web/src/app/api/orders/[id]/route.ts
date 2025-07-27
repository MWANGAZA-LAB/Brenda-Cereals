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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orders.find(o => o.id === id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { status } = await request.json();
  orders[idx] = { ...orders[idx], status };
  return NextResponse.json(orders[idx]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const deleted = orders.splice(idx, 1);
  return NextResponse.json(deleted[0]);
} 