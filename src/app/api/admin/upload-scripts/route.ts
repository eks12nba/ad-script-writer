import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

  const adSetPattern = /ad\s*set/i
  const scriptMarkerPattern = /^Ad\s*(Script\s*)?\d+/i
  const scriptMarkerFull = /^Ad\s*(Script\s*)?(\d+)\s*[–\-:]?\s*(.*)/i

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

      if (copyrightPattern.test(line)) {
        skipRest = true
        continue
      }

      if (isFilmingInstruction(line)) {
        inFilmingBlock = true
        continue
      }

      if (inFilmingBlock) {
        const trimmed = line.trim()
        if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed === '') {
          continue
        }
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

    if (adSetPattern.test(line) && !scriptMarkerPattern.test(line)) {
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

    const match = line.match(scriptMarkerFull)
    if (match) {
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

    if (currentScript) {
      currentScript.content += line + '\n'
    }
  }

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
    const user = await getCurrentUser()
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { fileData, fileName } = body

    if (!fileData) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 })
    }

    if (fileName && !fileName.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Please upload a PDF file' }, { status: 400 })
    }

    const buffer = Buffer.from(fileData, 'base64')

    const pdfParse = require('pdf-parse')
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    const scripts = parseScriptsFromText(text)

    if (scripts.length === 0) {
      return NextResponse.json({ error: 'No scripts found in the PDF' }, { status: 400 })
    }

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
