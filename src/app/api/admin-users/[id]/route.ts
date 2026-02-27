import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { id } = await params

    const existing = await prisma.adminUser.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    await prisma.adminUser.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Admin user removed' })
  } catch (error) {
    console.error('Failed to delete admin user:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin user' },
      { status: 500 }
    )
  }
}
