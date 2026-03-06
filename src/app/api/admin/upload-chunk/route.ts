import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import os from 'os'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { chunkIndex, totalChunks, chunkData, uploadId } = body

    const tempDir = path.join(os.tmpdir(), 'script-uploads')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const chunkPath = path.join(tempDir, `${uploadId}_chunk_${chunkIndex}`)
    fs.writeFileSync(chunkPath, chunkData)

    if (chunkIndex === totalChunks - 1) {
      let fullBase64 = ''
      for (let i = 0; i < totalChunks; i++) {
        const cp = path.join(tempDir, `${uploadId}_chunk_${i}`)
        fullBase64 += fs.readFileSync(cp, 'utf-8')
        fs.unlinkSync(cp)
      }

      const buffer = Buffer.from(fullBase64, 'base64')

      const pdfParse = require('pdf-parse')
      const pdfData = await pdfParse(buffer)
      const text: string = pdfData.text

      const scripts: { title: string; content: string; adSetName: string; scriptNumber: string }[] = []
      let currentAdSet = 'Unknown'
      const lines = text.split('\n')
      let currentScript: { title: string; content: string; adSetName: string; scriptNumber: string } | null = null

      const copyrightPattern = /©\s*Sell More Online|Rocket Search Marketing LLC/i
      const filmingPatterns = [
        /Film these vertical style/i,
        /Feel free to change ANY verbiage/i,
        /IMPORTANT: As you film/i,
        /Hit record > Say/i,
        /state the ad (?:script )?(?:name|number)/i,
        /make sure each (?:hook|ad|script)/i,
      ]

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) {
          if (currentScript) currentScript.content += '\n'
          continue
        }
        if (copyrightPattern.test(line)) continue
        if (filmingPatterns.some(p => p.test(line))) continue

        if (/Ad Set/i.test(line) && !/^Ad\s*(?:Script\s*)?\d+/i.test(line) && line.length < 100) {
          currentAdSet = line.replace(/^\f/, '').trim()
          continue
        }

        const isScriptStart =
          /^Ad\s*(?:Script\s*)?\d+[\s\-–:.]/i.test(line) ||
          /^Ad\s*(?:Script\s*)?\d+$/i.test(line) ||
          /^CREATIVE\s+AD\s+SCRIPT\s+\d+/i.test(line)

        if (isScriptStart) {
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
      return NextResponse.json({ success: true, done: true, count: scripts.length, adSets })
    }

    return NextResponse.json({ success: true, done: false, chunksReceived: chunkIndex + 1, totalChunks })
  } catch (error: unknown) {
    console.error('Chunk upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
