import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const pdfParse = require('pdf-parse')
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    const scripts: { title: string; content: string; adSetName: string; scriptNumber: string }[] = []
    let currentAdSet = 'Unknown'
    const lines = text.split('\n')
    let currentScript: { title: string; content: string; adSetName: string; scriptNumber: string } | null = null

    const adSetPattern = /Ad Set/i
    const scriptStartPattern = /^Ad\s*(?:Script\s*)?\d+[\s\-–:.]/i
    const creativeScriptPattern = /^CREATIVE\s+AD\s+SCRIPT\s+\d+/i
    const copyrightPattern = /©\s*Sell More Online|Rocket Search Marketing LLC/i
    const filmingPatterns = [
      /Film these vertical style/i,
      /Feel free to change ANY verbiage/i,
      /IMPORTANT: As you film/i,
      /Hit record > Say/i,
      /state the ad (?:script )?(?:name|number)/i,
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        if (currentScript) currentScript.content += '\n'
        continue
      }
      if (copyrightPattern.test(line)) continue
      if (filmingPatterns.some(p => p.test(line))) continue

      if (adSetPattern.test(line) && !scriptStartPattern.test(line) && !creativeScriptPattern.test(line) && line.length < 100) {
        currentAdSet = line.replace(/^\f/, '').trim()
        continue
      }

      const scriptMatch = line.match(scriptStartPattern) || line.match(creativeScriptPattern)
      if (scriptMatch) {
        if (currentScript && currentScript.content.trim().length > 100) {
          scripts.push({ ...currentScript, content: currentScript.content.trim() })
        }
        const numMatch = line.match(/\d+/)
        currentScript = {
          title: line,
          content: '',
          adSetName: currentAdSet,
          scriptNumber: numMatch ? numMatch[0] : '',
        }
        continue
      }

      if (currentScript) {
        currentScript.content += line + '\n'
      }
    }

    if (currentScript && currentScript.content.trim().length > 100) {
      scripts.push({ ...currentScript, content: currentScript.content.trim() })
    }

    await prisma.scriptLibrary.deleteMany()

    if (scripts.length > 0) {
      await prisma.scriptLibrary.createMany({
        data: scripts.map(s => ({
          title: s.title,
          content: s.content,
          adSetName: s.adSetName,
          scriptNumber: s.scriptNumber,
        }))
      })
    }

    const adSets = [...new Set(scripts.map(s => s.adSetName))]

    return NextResponse.json({ success: true, count: scripts.length, adSets })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
