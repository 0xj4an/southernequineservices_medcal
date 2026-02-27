import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const medication = await prisma.medication.findUnique({
      where: { id },
    })

    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Failed to fetch medication:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.medication.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      )
    }

    const medication = await prisma.medication.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        doseMin: body.doseMin,
        doseMax: body.doseMax,
        concentration: body.concentration,
        concentrationUnit: body.concentrationUnit,
        route: body.route,
        notes: body.notes,
        isDefault: body.isDefault,
      },
    })

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Failed to update medication:', error)
    return NextResponse.json(
      { error: 'Failed to update medication' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { id } = await params

    const existing = await prisma.medication.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      )
    }

    await prisma.medication.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Medication deleted' })
  } catch (error) {
    console.error('Failed to delete medication:', error)
    return NextResponse.json(
      { error: 'Failed to delete medication' },
      { status: 500 }
    )
  }
}
