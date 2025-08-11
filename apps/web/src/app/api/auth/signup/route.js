import { NextResponse } from 'next/server';
export async function POST(request) {
    try {
        const { name, email, phone, password } = await request.json();
        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
        }
        // Mock user creation for development
        const mockUser = {
            id: `user-${Date.now()}`,
            name,
            email,
            phone: phone || null,
            createdAt: new Date().toISOString()
        };
        return NextResponse.json({
            message: 'User created successfully',
            user: mockUser
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
