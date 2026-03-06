import { prisma } from '@/lib/prisma'

export async function getRandomScripts(count: number) {
  const allIds = await prisma.scriptLibrary.findMany({ select: { id: true } })

  if (allIds.length === 0) return []

  // Shuffle and take N
  const shuffled = allIds.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, allIds.length))

  const scripts = await prisma.scriptLibrary.findMany({
    where: { id: { in: selected.map((s) => s.id) } },
  })

  return scripts
}
