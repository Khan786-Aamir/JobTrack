import { store } from '../store.js'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

async function extractText(buffer, filename) {
  if (filename.endsWith('.txt')) {
    return buffer.toString('utf-8')
  }
  if (filename.endsWith('.pdf')) {
    try {
      // Dynamically import pdf-parse
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      return data.text
    } catch (e) {
      // Fallback: return raw buffer text
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ')
    }
  }
  return buffer.toString('utf-8')
}

export default async function resumeRoutes(app) {
  app.post('/upload-resume', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const data = await req.file()
    if (!data) return reply.code(400).send({ error: 'No file uploaded' })

    const filename = data.filename
    if (!filename.match(/\.(pdf|txt)$/i)) {
      return reply.code(400).send({ error: 'Only PDF and TXT files allowed' })
    }

    const chunks = []
    for await (const chunk of data.file) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    const text = await extractText(buffer, filename.toLowerCase())

    store.resume = {
      text,
      filename,
      uploadedAt: new Date().toISOString(),
      size: buffer.length
    }

    return { ok: true, filename, size: buffer.length, preview: text.slice(0, 200) }
  })

  app.get('/resume', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    if (!store.resume) return reply.code(404).send({ error: 'No resume uploaded' })
    return {
      filename: store.resume.filename,
      uploadedAt: store.resume.uploadedAt,
      size: store.resume.size,
      preview: store.resume.text.slice(0, 300)
    }
  })

  app.delete('/resume', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    store.resume = null
    return { ok: true }
  })
}
