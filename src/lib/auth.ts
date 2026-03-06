import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    throw new Error('Not authenticated')
  }

  let user = await prisma.user.findUnique({
    where: { clerkId },
    include: { profile: true },
  })

  if (!user) {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(clerkId)
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
        isAdmin: email === 'evan@sellmoreonline.io',
      },
      include: { profile: true },
    })
  }

  if (user.email === 'evan@sellmoreonline.io' && !user.isAdmin) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
      include: { profile: true },
    })
  }

  return user
}
