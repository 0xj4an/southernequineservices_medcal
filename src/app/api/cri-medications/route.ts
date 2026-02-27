import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const criMedications = await prisma.criMedication.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(criMedications)
  } catch (error) {
    console.error('Failed to fetch CRI medications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CRI medications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = [
      'name',
      'category',
      'loadingDoseMin',
      'loadingDoseMax',
      'rateMin',
      'rateMax',
      'rateUnit',
      'concentration',
    ] as const

    const missingFields = requiredFields.filter(
      (field) => body[field] === undefined || body[field] === null
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const criMedication = await prisma.criMedication.create({
      data: {
        name: body.name,
        category: body.category,
        loadingDoseMin: body.loadingDoseMin,
        loadingDoseMax: body.loadingDoseMax,
        rateMin: body.rateMin,
        rateMax: body.rateMax,
        rateUnit: body.rateUnit,
        concentration: body.concentration,
        concentrationUnit: body.concentrationUnit ?? 'mg/ml',
        notes: body.notes ?? null,
      },
    })

    return NextResponse.json(criMedication, { status: 201 })
  } catch (error) {
    console.error('Failed to create CRI medication:', error)
    return NextResponse.json(
      { error: 'Failed to create CRI medication' },
      { status: 500 }
    )
  }
}
