import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        hasOnboarded: user.hasOnboarded,
      },
      profile: user.profile,
    })
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        serviceName: body.serviceName ?? null,
        tangibleService: body.tangibleService ?? null,
        directOutcome: body.directOutcome ?? null,
        benefitsOfOutcome: body.benefitsOfOutcome ?? null,
        differentiators: body.differentiators ?? null,
        caseStudies: body.caseStudies ?? null,
        impliedAuthority: body.impliedAuthority ?? null,
        coreOutcome: body.coreOutcome ?? null,
        avatars: body.avatars ?? null,
        bigOpportunities: body.bigOpportunities ?? null,
        deliverablesList: body.deliverablesList ?? null,
        clientProcess: body.clientProcess ?? null,
      },
      create: {
        userId: user.id,
        serviceName: body.serviceName ?? null,
        tangibleService: body.tangibleService ?? null,
        directOutcome: body.directOutcome ?? null,
        benefitsOfOutcome: body.benefitsOfOutcome ?? null,
        differentiators: body.differentiators ?? null,
        caseStudies: body.caseStudies ?? null,
        impliedAuthority: body.impliedAuthority ?? null,
        coreOutcome: body.coreOutcome ?? null,
        avatars: body.avatars ?? null,
        bigOpportunities: body.bigOpportunities ?? null,
        deliverablesList: body.deliverablesList ?? null,
        clientProcess: body.clientProcess ?? null,
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { hasOnboarded: true },
    })

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
