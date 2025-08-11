import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const inStock = searchParams.get('inStock');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        if (category && category !== 'all') {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (inStock !== null && inStock !== undefined) {
            where.inStock = inStock === 'true';
        }
        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            prisma.product.count({ where })
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        return NextResponse.json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(request) {
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
        const { name, description, price, weight, category, image, inStock } = await request.json();
        // Validation
        if (!name || !price || !weight) {
            return NextResponse.json({ error: 'Name, price, and weight are required' }, { status: 400 });
        }
        if (price <= 0) {
            return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
        }
        // Check if product with same name exists
        const existingProduct = await prisma.product.findFirst({
            where: { name }
        });
        if (existingProduct) {
            return NextResponse.json({ error: 'Product with this name already exists' }, { status: 400 });
        }
        // Generate slug from name
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        // Find or create category
        let categoryRecord = await prisma.category.findFirst({
            where: { name: category || 'CEREAL' }
        });
        if (!categoryRecord) {
            categoryRecord = await prisma.category.create({
                data: {
                    name: category || 'CEREAL',
                    slug: (category || 'CEREAL').toLowerCase().replace(/\s+/g, '-'),
                    description: `${category || 'CEREAL'} products`
                }
            });
        }
        const newProduct = await prisma.product.create({
            data: {
                name,
                slug,
                description: description || '',
                image: image || '/placeholder-product.jpg',
                inStock: inStock !== false,
                categoryId: categoryRecord.id,
                variants: {
                    create: {
                        name: weight || '1kg',
                        weight: weight || '1kg',
                        price: Math.round(parseFloat(price) * 100), // Convert to cents
                        inStock: inStock !== false,
                        inventory: 100 // Default inventory
                    }
                }
            },
            include: {
                variants: true,
                category: true
            }
        });
        return NextResponse.json({
            success: true,
            product: newProduct
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
