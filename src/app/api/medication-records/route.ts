import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

// PUBLIC — vets save records in the field without logging in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { surgeonName, horseName, procedureName, weightKg, protocol } = body

    if (!surgeonName || !horseName || !procedureName || !weightKg) {
      return NextResponse.json(
        { error: 'Missing required fields: surgeonName, horseName, procedureName, weightKg' },
        { status: 400 }
      )
    }

    if (!Array.isArray(protocol) || protocol.length === 0) {
      return NextResponse.json(
        { error: 'Protocol must contain at least one medication' },
        { status: 400 }
      )
    }

    const record = await prisma.medicationRecord.create({
      data: {
        surgeonName: String(surgeonName).trim(),
        horseName: String(horseName).trim(),
        procedureName: String(procedureName).trim(),
        weightKg: Number(weightKg),
        protocol,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Failed to create medication record:', error)
    return NextResponse.json(
      { error: 'Failed to create medication record' },
      { status: 500 }
    )
  }
}

// PROTECTED — admin can view records
export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const records = await prisma.medicationRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Failed to fetch medication records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication records' },
      { status: 500 }
    )
  }
}
