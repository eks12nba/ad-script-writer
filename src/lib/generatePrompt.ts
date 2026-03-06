interface Framework {
  name: string
  structure: string
  toneGuidance: string | null
  exampleHooks: string | null
  exampleBodies: string | null
  exampleCTAs: string | null
  fullExamples: string | null
}

interface UserProfile {
  serviceName: string | null
  tangibleService: string | null
  directOutcome: string | null
  benefitsOfOutcome: string | null
  differentiators: string | null
  caseStudies: string | null
  impliedAuthority: string | null
  coreOutcome: string | null
  avatars: string | null
  deliverablesList: string | null
  clientProcess: string | null
}

interface PromptInput {
  framework: Framework
  userProfile: UserProfile
  overrides?: Partial<UserProfile>
  selectedAvatar: string
  numberOfScripts: number
}

function tryParseArray(val: string | null): string[] {
  if (!val) return []
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed.filter((s: string) => s && s.trim()) : []
  } catch {
    return val.trim() ? [val] : []
  }
}

function formatList(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join('\n')
}

export function buildPrompt(input: PromptInput): { systemPrompt: string; userMessage: string } {
  const { framework, userProfile, overrides, selectedAvatar, numberOfScripts } = input
  const profile = { ...userProfile, ...overrides }

  const exampleHooks = tryParseArray(framework.exampleHooks)
  const exampleBodies = tryParseArray(framework.exampleBodies)
  const exampleCTAs = tryParseArray(framework.exampleCTAs)
  const fullExamples = tryParseArray(framework.fullExamples)

  let systemPrompt = `You are a direct-response ad script writer for Meta (Facebook/Instagram) video ads. You write scripts that will be filmed vertically (9:16) and spoken directly to camera. You work for a marketing agency called Sell More Online that has written over 500 ad scripts across dozens of industries.

You are writing using the "${framework.name}" approach, but DO NOT treat it as a rigid template. It's a creative direction. Your scripts should feel natural, varied, and human — never formulaic.

CREATIVE DIRECTION FOR THIS BATCH:
${framework.structure}

TONE:
${framework.toneGuidance || 'Conversational, spoken-aloud, real. Not corporate. Not polished. Like a real person talking to another real person on camera.'}`

  if (exampleHooks.length > 0) {
    systemPrompt += `\n\nEXAMPLE HOOKS FROM PROVEN SCRIPTS (study the style, not the exact words):\n${formatList(exampleHooks)}`
  }

  if (exampleBodies.length > 0) {
    systemPrompt += `\n\nEXAMPLE BODY SECTIONS FROM PROVEN SCRIPTS:\n${formatList(exampleBodies)}`
  }

  if (exampleCTAs.length > 0) {
    systemPrompt += `\n\nEXAMPLE CTAs FROM PROVEN SCRIPTS:\n${formatList(exampleCTAs)}`
  }

  if (fullExamples.length > 0) {
    systemPrompt += `\n\nFULL PROVEN SCRIPTS (these are real scripts that generated results — study the rhythm, tone, specificity, and flow. Your scripts should feel like they belong in this collection):\n${fullExamples.map((ex, i) => `--- Script ${i + 1} ---\n${ex}`).join('\n\n')}`
  }

  systemPrompt += `

=== WRITING RULES ===

THESE SCRIPTS WILL BE SPOKEN OUT LOUD ON CAMERA. Write like a human talks, not like a human writes. Short sentences. Fragments are fine. Pauses are fine. Contractions always.

NEVER SOUND LIKE AI:
- No "In today's [industry]..." openings
- No "Here's the thing..." unless natural
- No "Let me be clear" or "Let me explain"
- No "Are you tired of..." (infomercial garbage)
- No buzzwords: leverage, streamline, elevate, unlock, empower, cutting-edge, game-changer, revolutionary
- No perfect grammar if it sounds stiff — contractions, casual phrasing, starting with "And" or "But" is fine
- No long complex sentences. If you can't say it in one breath, break it up.
- No generic statements that could apply to anyone
- Do not use em dashes excessively
- Do not start multiple sentences the same way within a script

HOOKS (0-10 seconds):
- 1-3 sentences max
- Must be specific enough the target avatar thinks "that's literally me"
- Vary styles: questions, statements, provocative claims, stories, numbers
- DO NOT start every hook with "If you're a..." — mix it up

BODY (11-90 seconds):
- Use the client's SPECIFIC case studies, numbers, and proof
- Short paragraphs. One thought per paragraph.
- Vary structure between scripts

CTA (90-120 seconds):
- End with Meta CTA: "Click the learn more button below" or similar
- Usually: click → watch video → book call
- Keep it 2-4 sentences max

VARIETY:
- Each script must use a genuinely DIFFERENT angle
- Different openings, structures, energy, arguments
- Reading all scripts back to back should NOT feel repetitive

OUTPUT FORMAT:
Return ONLY a JSON array. No markdown, no backticks, no explanation. Each element:
{"title": "Short title", "angle": "One sentence angle description", "hook": "Hook text", "body": "Body text", "cta": "CTA text", "fullScript": "Complete script flowing naturally with no labels"}`

  // Build user message with only non-empty fields
  const fields: [string, string | null][] = [
    ['Offer Name', profile.serviceName],
    ['Service/Deliverables', profile.tangibleService],
    ['Direct Outcome', profile.directOutcome],
    ['Benefits', profile.benefitsOfOutcome],
    ['Differentiators', profile.differentiators],
    ['Case Studies', profile.caseStudies],
    ['Authority/Credibility', profile.impliedAuthority],
    ['Core Outcome', profile.coreOutcome],
    ['Target Avatar', selectedAvatar],
    ['Full Deliverables', profile.deliverablesList],
    ['Client Process', profile.clientProcess],
  ]

  const clientInfo = fields
    .filter(([, val]) => val && val.trim())
    .map(([label, val]) => `- ${label}: ${val}`)
    .join('\n')

  const userMessage = `Write ${numberOfScripts} unique Meta ad scripts. Each MUST use a completely different angle.

CLIENT INFORMATION:
${clientInfo}

Write ${numberOfScripts} scripts. Make each one genuinely different. Return ONLY the JSON array.`

  return { systemPrompt, userMessage }
}
