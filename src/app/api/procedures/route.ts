import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

export async function GET() {
  try {
    const procedures = await prisma.procedure.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('Failed to fetch procedures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch procedures' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const procedure = await prisma.procedure.create({
      data: {
        name: body.name.trim(),
        isDefault: false,
      },
    })

    return NextResponse.json(procedure, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A procedure with this name already exists' },
        { status: 409 }
      )
    }
    console.error('Failed to create procedure:', error)
    return NextResponse.json(
      { error: 'Failed to create procedure' },
      { status: 500 }
    )
  }
}
