import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@clerk/backend'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ParsedScript {
  title: string
  content: string
  adSetName: string
  scriptNumber: string
}

function parseScriptsFromText(text: string): ParsedScript[] {
  const lines = text.split('\n')
  const scripts: ParsedScript[] = []
  let currentAdSet = 'Unknown Ad Set'
  let currentScript: ParsedScript | null = null

  // Patterns
  const adSetPattern = /ad\s*set/i
  const scriptMarkerPattern = /^Ad\s*(Script\s*)?\d+/i
  const scriptMarkerFull = /^Ad\s*(Script\s*)?(\d+)\s*[–\-:]?\s*(.*)/i

  // Copyright and filming instruction patterns to strip
  const copyrightPattern = /©\s*Sell\s*More\s*Online/i
  const filmingPatterns = [
    /^Film\s+these\s+vertical/i,
    /^Feel\s+free\s+to\s+change/i,
    /^IMPORTANT:\s*As\s+you\s+film/i,
    /^These\s+scripts\s+are\s+written/i,
    /^Record\s+these\s+in/i,
    /^Filming\s+instructions/i,
    /^Filming\s+notes/i,
  ]

  function isFilmingInstruction(line: string): boolean {
    const trimmed = line.trim()
    return filmingPatterns.some((p) => p.test(trimmed))
  }

  function cleanContent(raw: string): string {
    const contentLines = raw.split('\n')
    const cleaned: string[] = []
    let skipRest = false
    let inFilmingBlock = false

    for (const line of contentLines) {
      if (skipRest) break

      // Stop at copyright
      if (copyrightPattern.test(line)) {
        skipRest = true
        continue
      }

      // Detect filming instruction blocks
      if (isFilmingInstruction(line)) {
        inFilmingBlock = true
        continue
      }

      // If in filming block, skip bullet points and short lines that are part of instructions
      if (inFilmingBlock) {
        const trimmed = line.trim()
        if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed === '') {
          continue
        }
        // If we hit a substantial line that's not a bullet, end the filming block
        if (trimmed.length > 50) {
          inFilmingBlock = false
        } else {
          continue
        }
      }

      cleaned.push(line)
    }

    return cleaned.join('\n').trim()
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Check for ad set header
    if (adSetPattern.test(line) && !scriptMarkerPattern.test(line)) {
      // Save current script if any
      if (currentScript && currentScript.content.trim()) {
        currentScript.content = cleanContent(currentScript.content)
        if (currentScript.content.length >= 100) {
          scripts.push({ ...currentScript })
        }
      }
      currentScript = null
      currentAdSet = line.replace(/^\d+\.\s*/, '').trim()
      continue
    }

    // Check for script marker
    const match = line.match(scriptMarkerFull)
    if (match) {
      // Save previous script
      if (currentScript && currentScript.content.trim()) {
        currentScript.content = cleanContent(currentScript.content)
        if (currentScript.content.length >= 100) {
          scripts.push({ ...currentScript })
        }
      }

      const scriptNum = match[2]
      const titleSuffix = match[3]?.trim() || ''
      const title = titleSuffix ? `Ad Script ${scriptNum} – ${titleSuffix}` : `Ad Script ${scriptNum}`

      currentScript = {
        title,
        content: '',
        adSetName: currentAdSet,
        scriptNumber: scriptNum,
      }
      continue
    }

    // Accumulate content into current script
    if (currentScript) {
      currentScript.content += line + '\n'
    }
  }

  // Don't forget the last script
  if (currentScript && currentScript.content.trim()) {
    currentScript.content = cleanContent(currentScript.content)
    if (currentScript.content.length >= 100) {
      scripts.push({ ...currentScript })
    }
  }

  return scripts
}

export async function POST(request: NextRequest) {
  try {
    // Manual auth: verify Clerk session token from cookie (middleware is bypassed for this route)
    const token = request.cookies.get('__session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    })
    const clerkId = payload.sub
    if (!clerkId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Please upload a PDF file' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    const text = data.text

    const scripts = parseScriptsFromText(text)

    if (scripts.length === 0) {
      return NextResponse.json({ error: 'No scripts found in the PDF' }, { status: 400 })
    }

    // Bulk insert
    await prisma.scriptLibrary.createMany({
      data: scripts.map((s) => ({
        title: s.title,
        content: s.content,
        adSetName: s.adSetName,
        scriptNumber: s.scriptNumber,
      })),
    })

    const adSets = [...new Set(scripts.map((s) => s.adSetName))]

    return NextResponse.json({
      success: true,
      count: scripts.length,
      adSets,
    })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
