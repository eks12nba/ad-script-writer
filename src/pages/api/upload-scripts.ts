import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function parseMultipart(buffer: Buffer, boundary: string): Buffer | null {
  const boundaryBuffer = Buffer.from('--' + boundary)
  const start = buffer.indexOf(boundaryBuffer)
  if (start === -1) return null

  const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), start)
  if (headerEnd === -1) return null

  const contentStart = headerEnd + 4

  const endBoundary = buffer.indexOf(boundaryBuffer, contentStart)
  if (endBoundary === -1) return null

  return buffer.subarray(contentStart, endBoundary - 2)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const rawBody = await getRawBody(req)

    const contentType = req.headers['content-type'] || ''
    const boundaryMatch = contentType.match(/boundary=(.+)/)
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'No boundary found in content-type' })
    }

    const pdfBuffer = parseMultipart(rawBody, boundaryMatch[1])
    if (!pdfBuffer) {
      return res.status(400).json({ error: 'Could not extract file from upload' })
    }

    const pdfParse = require('pdf-parse')
    const pdfData = await pdfParse(pdfBuffer)
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

      const isScriptStart = /^Ad\s*(?:Script\s*)?\d+[\s\-–:.]/i.test(line) || /^CREATIVE\s+AD\s+SCRIPT\s+\d+/i.test(line)
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
    return res.status(200).json({ success: true, count: scripts.length, adSets })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return res.status(500).json({ error: message })
  }
}
