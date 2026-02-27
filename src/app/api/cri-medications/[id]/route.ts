import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const criMedication = await prisma.criMedication.findUnique({
      where: { id },
    })

    if (!criMedication) {
      return NextResponse.json(
        { error: 'CRI medication not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(criMedication)
  } catch (error) {
    console.error('Failed to fetch CRI medication:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CRI medication' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.criMedication.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'CRI medication not found' },
        { status: 404 }
      )
    }

    const criMedication = await prisma.criMedication.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        loadingDoseMin: body.loadingDoseMin,
        loadingDoseMax: body.loadingDoseMax,
        rateMin: body.rateMin,
        rateMax: body.rateMax,
        rateUnit: body.rateUnit,
        concentration: body.concentration,
        concentrationUnit: body.concentrationUnit,
        notes: body.notes,
      },
    })

    return NextResponse.json(criMedication)
  } catch (error) {
    console.error('Failed to update CRI medication:', error)
    return NextResponse.json(
      { error: 'Failed to update CRI medication' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.criMedication.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'CRI medication not found' },
        { status: 404 }
      )
    }

    await prisma.criMedication.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'CRI medication deleted' })
  } catch (error) {
    console.error('Failed to delete CRI medication:', error)
    return NextResponse.json(
      { error: 'Failed to delete CRI medication' },
      { status: 500 }
    )
  }
}
