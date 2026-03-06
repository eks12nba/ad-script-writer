import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const frameworks = [
  {
    name: 'Freestyle — Let It Rip',
    slug: 'freestyle',
    sortOrder: 1,
    description: 'No rigid framework. The AI writes freely based on your proven scripts and offer data. Best for maximum variety.',
    structure: 'Write varied ad scripts that feel natural and conversational. Do NOT follow a rigid template. Each script should feel completely different — different openings, structures, energy. The only rules: Hook stops the scroll in under 10 seconds. Body keeps them watching. CTA drives action.',
    toneGuidance: 'Conversational, spoken-aloud, real. Not corporate. Not polished. Like a real person talking to another real person on camera.',
  },
  {
    name: 'The Pain Call-Out',
    slug: 'pain-call-out',
    sortOrder: 2,
    description: 'Opens by naming a specific pain point the viewer is experiencing right now.',
    structure: "Open by calling out a specific pain so precisely they think 'that's literally me.' Validate it. Describe their reality. Pivot to the solution.",
    toneGuidance: 'Empathetic but confident. Conversational. No lecturing.',
  },
  {
    name: 'The Trap / False Belief',
    slug: 'trap-false-belief',
    sortOrder: 3,
    description: 'Calls out something they\'re doing wrong or a belief holding them back.',
    structure: "Call out a common approach that's actually the reason they're stuck. Explain WHY it fails. Introduce the better way as a revelation, not a sales pitch.",
    toneGuidance: 'Slightly provocative but not condescending. Like a smart friend telling you the truth.',
  },
  {
    name: 'The Case Study / Proof Story',
    slug: 'case-study-proof',
    sortOrder: 4,
    description: 'Leads with a specific client result. Let the proof do the selling.',
    structure: "Open with a compelling client result. Tell the story — before, problem, solution, transformation. Use real numbers. Then broaden to show it's not a one-off.",
    toneGuidance: 'Proud but humble. Conversational storytelling.',
  },
  {
    name: 'The Offer Breakdown',
    slug: 'offer-breakdown',
    sortOrder: 5,
    description: 'Direct presentation of what they get. No fluff, just value.',
    structure: 'Get straight to the offer. Stack deliverables framed as outcomes. Make value feel overwhelming. Direct and confident.',
    toneGuidance: 'Direct, confident, generous. Cards on the table.',
  },
  {
    name: 'The Identity Shift',
    slug: 'identity-shift',
    sortOrder: 6,
    description: 'Contrasts who they are now vs. who they could become.',
    structure: "Highlight the gap between current identity and aspirational one. Paint both pictures. Show transformation is about systems, not just harder work.",
    toneGuidance: 'Aspirational but grounded. Real, not hype.',
  },
  {
    name: 'The Math / Logic Hook',
    slug: 'math-logic-hook',
    sortOrder: 7,
    description: 'Opens with a number or stat that\'s impossible to ignore.',
    structure: 'Lead with a surprising number. Walk through the logic. Make it undeniable. Show how your system leverages it.',
    toneGuidance: 'Smart and analytical but conversational.',
  },
  {
    name: 'The Objection Crusher',
    slug: 'objection-crusher',
    sortOrder: 8,
    description: 'Takes their biggest excuse head-on and dismantles it.',
    structure: 'Name the objection in the hook. Validate it. Then systematically dismantle it with proof and examples.',
    toneGuidance: 'Respectful but unshakeable.',
  },
  {
    name: 'The Bet / Risk Reversal',
    slug: 'bet-risk-reversal',
    sortOrder: 9,
    description: 'Frames the offer as a no-risk bet or guarantee.',
    structure: 'Open with a bold bet or guarantee. Explain the terms. Stack credibility. Show others who took the bet and won.',
    toneGuidance: 'Bold, playful, confident.',
  },
  {
    name: 'The Enemy / Broken System',
    slug: 'enemy-broken-system',
    sortOrder: 10,
    description: 'Names an external enemy and positions your offer as the antidote.',
    structure: "Call out the enemy specifically. Show how they've failed. Position yourself as fundamentally different.",
    toneGuidance: 'Righteous anger for them, calm confidence about your solution.',
  },
  {
    name: 'The Opportunity Window',
    slug: 'opportunity-window',
    sortOrder: 11,
    description: 'Creates urgency around something happening RIGHT NOW.',
    structure: 'Open with timing and a specific market condition. Provide evidence. Show how your offer capitalizes on the window.',
    toneGuidance: 'Excited, urgent but not panicky.',
  },
]

async function main() {
  console.log('Seeding frameworks...')

  for (const fw of frameworks) {
    await prisma.framework.upsert({
      where: { slug: fw.slug },
      update: {
        name: fw.name,
        description: fw.description,
        structure: fw.structure,
        toneGuidance: fw.toneGuidance,
        sortOrder: fw.sortOrder,
      },
      create: {
        name: fw.name,
        slug: fw.slug,
        description: fw.description,
        structure: fw.structure,
        toneGuidance: fw.toneGuidance,
        exampleHooks: '[]',
        exampleBodies: '[]',
        exampleCTAs: '[]',
        fullExamples: '[]',
        sortOrder: fw.sortOrder,
        isActive: true,
      },
    })
    console.log(`  ✓ ${fw.name}`)
  }

  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
