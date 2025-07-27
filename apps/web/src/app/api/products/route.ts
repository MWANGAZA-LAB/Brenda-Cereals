import { NextRequest, NextResponse } from 'next/server';

let products = [
  {
    id: 'maize',
    name: 'Maize (White)',
    image: '/maize-product.jpg',
    prices: { '1kg': 120, '5kg': 550, '50kg': 5000 },
    inStock: true,
  },
  {
    id: 'beans',
    name: 'Beans (Rosecoco)',
    image: '/beans-product.jpg',
    prices: { '1kg': 180, '5kg': 850, '50kg': 8000 },
    inStock: true,
  },
];

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { name, image, prices, inStock } = await request.json();
  const newProduct = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    image,
    prices,
    inStock,
  };
  products.push(newProduct);
  return NextResponse.json(newProduct, { status: 201 });
} 