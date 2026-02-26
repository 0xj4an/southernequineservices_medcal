import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const medications = await prisma.medication.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(medications)
  } catch (error) {
    console.error('Failed to fetch medications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medications' },
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
      'doseMin',
      'doseMax',
      'concentration',
      'route',
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

    const medication = await prisma.medication.create({
      data: {
        name: body.name,
        category: body.category,
        doseMin: body.doseMin,
        doseMax: body.doseMax,
        concentration: body.concentration,
        concentrationUnit: body.concentrationUnit ?? 'mg/ml',
        route: body.route,
        notes: body.notes ?? null,
        isDefault: body.isDefault ?? false,
      },
    })

    return NextResponse.json(medication, { status: 201 })
  } catch (error) {
    console.error('Failed to create medication:', error)
    return NextResponse.json(
      { error: 'Failed to create medication' },
      { status: 500 }
    )
  }
}
