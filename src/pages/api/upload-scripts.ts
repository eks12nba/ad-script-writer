import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import { prisma } from '@/lib/prisma'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm({ maxFileSize: 50 * 1024 * 1024 })

    const [, files] = await new Promise<[Record<string, unknown>, Record<string, unknown>]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const fileEntry = files.file
    const uploadedFile = (Array.isArray(fileEntry) ? fileEntry[0] : fileEntry) as {
      filepath: string
      originalFilename: string | null
      size: number
    } | undefined

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const buffer = fs.readFileSync(uploadedFile.filepath)

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

    fs.unlinkSync(uploadedFile.filepath)

    return res.status(200).json({ success: true, count: scripts.length, adSets })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return res.status(500).json({ error: message })
  }
}
