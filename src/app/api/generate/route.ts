import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/anthropic'
import { buildPrompt } from '@/lib/generatePrompt'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()

    const { frameworkId, numberOfScripts = 3, selectedAvatar = '', overrides } = body

    if (!frameworkId) {
      return NextResponse.json({ error: 'frameworkId is required' }, { status: 400 })
    }

    const clampedCount = Math.min(Math.max(Number(numberOfScripts) || 3, 1), 5)

    const framework = await prisma.framework.findUnique({
      where: { id: frameworkId },
    })

    if (!framework) {
      return NextResponse.json({ error: 'Framework not found' }, { status: 404 })
    }

    const profile = user.profile
    if (!profile) {
      return NextResponse.json({ error: 'Please complete onboarding first' }, { status: 400 })
    }

    const { systemPrompt, userMessage } = buildPrompt({
      framework,
      userProfile: profile,
      overrides,
      selectedAvatar,
      numberOfScripts: clampedCount,
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text in AI response' }, { status: 500 })
    }

    let rawText = textBlock.text.trim()
    // Strip markdown backticks if present
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    let scripts: Array<{
      title: string
      angle: string
      hook: string
      body: string
      cta: string
      fullScript: string
    }>

    try {
      scripts = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: rawText }, { status: 500 })
    }

    const generation = await prisma.generation.create({
      data: {
        userId: user.id,
        frameworkId: framework.id,
        inputData: JSON.stringify({ selectedAvatar, overrides }),
        scriptsGenerated: scripts.length,
      },
    })

    const createdScripts = await Promise.all(
      scripts.map((script) =>
        prisma.generatedScript.create({
          data: {
            userId: user.id,
            generationId: generation.id,
            title: script.title || 'Untitled Script',
            hook: script.hook || '',
            body: script.body || '',
            cta: script.cta || '',
            fullScript: script.fullScript || '',
            frameworkName: framework.name,
          },
        })
      )
    )

    return NextResponse.json({ generation, scripts: createdScripts })
  } catch (err) {
    console.error('Generate error:', err)
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
