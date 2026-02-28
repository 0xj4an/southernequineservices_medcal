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

    const existing = await prisma.medicationRecord.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }

    await prisma.medicationRecord.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Record deleted' })
  } catch (error) {
    console.error('Failed to delete medication record:', error)
    return NextResponse.json(
      { error: 'Failed to delete medication record' },
      { status: 500 }
    )
  }
}
