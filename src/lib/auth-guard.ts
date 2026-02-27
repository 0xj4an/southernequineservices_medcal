import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

/**
 * Returns a 401 response if the request is not authenticated.
 * Returns null if the user is authenticated.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
