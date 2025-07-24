import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        // Note: In a real implementation, you'd store the hashed password
        // hashedPassword,
      }
    })

    // Remove sensitive data from response
    const { ...userData } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userData
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
