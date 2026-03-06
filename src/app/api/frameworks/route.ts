import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const frameworks = await prisma.framework.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ frameworks })
  } catch {
    return NextResponse.json({ error: 'Failed to load frameworks' }, { status: 500 })
  }
}
