import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const total = await prisma.scriptLibrary.count()

    // Get distinct ad sets with counts
    const adSetCounts = await prisma.scriptLibrary.groupBy({
      by: ['adSetName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })

    // Get 3 random sample scripts
    const allIds = await prisma.scriptLibrary.findMany({ select: { id: true } })
    const shuffled = allIds.sort(() => Math.random() - 0.5).slice(0, 3)
    const samples = shuffled.length > 0
      ? await prisma.scriptLibrary.findMany({
          where: { id: { in: shuffled.map((s) => s.id) } },
        })
      : []

    return NextResponse.json({
      total,
      adSets: adSetCounts.map((a) => ({
        name: a.adSetName || 'Unknown',
        count: a._count.id,
      })),
      samples,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load library stats' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser()
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.scriptLibrary.deleteMany()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to clear library' }, { status: 500 })
  }
}
