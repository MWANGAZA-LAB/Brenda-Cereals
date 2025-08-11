import { NextResponse } from 'next/server';
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
export async function GET(_request, { params }) {
    const { id } = await params;
    const product = products.find(p => p.id === id);
    if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
}
export async function PUT(request, { params }) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const { name, image, prices, inStock } = await request.json();
    products[idx] = { ...products[idx], name, image, prices, inStock };
    return NextResponse.json(products[idx]);
}
export async function DELETE(request, { params }) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const deleted = products.splice(idx, 1);
    return NextResponse.json(deleted[0]);
}
