import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const adminUsers = await prisma.adminUser.findMany({
      orderBy: { email: 'asc' },
    })
    return NextResponse.json(adminUsers)
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const email = body.email.toLowerCase().trim()

    const existing = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already an admin' },
        { status: 409 }
      )
    }

    const adminUser = await prisma.adminUser.create({
      data: {
        email,
        name: body.name ?? null,
      },
    })

    return NextResponse.json(adminUser, { status: 201 })
  } catch (error) {
    console.error('Failed to create admin user:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
