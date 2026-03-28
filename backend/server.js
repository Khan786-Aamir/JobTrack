import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import resumeRoutes from './routes/resume.js'
import jobRoutes from './routes/jobs.js'
import matchRoutes from './routes/match.js'
import applyRoutes from './routes/apply.js'
import assistantRoutes from './routes/assistant.js'

dotenv.config()

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://jobtrack-frontend-ei14.onrender.com'
  ],
  credentials: true
})

await app.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 }
})

app.register(authRoutes, { prefix: '/api' })
app.register(resumeRoutes, { prefix: '/api' })
app.register(jobRoutes, { prefix: '/api' })
app.register(matchRoutes, { prefix: '/api' })
app.register(applyRoutes, { prefix: '/api' })
app.register(assistantRoutes, { prefix: '/api' })

app.get('/health', async () => ({ status: 'ok' }))

try {
  const port = process.env.PORT || 4000

  await app.listen({
    port,
    host: '0.0.0.0'
  })

  console.log(`🚀 Server running on port ${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
