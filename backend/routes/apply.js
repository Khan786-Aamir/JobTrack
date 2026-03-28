import { store } from '../store.js'
import { MOCK_JOBS } from '../data/jobs.js'

export default async function applyRoutes(app) {
  // Save application
  app.post('/apply', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const { jobId, status } = req.body
    if (!jobId || !status) return reply.code(400).send({ error: 'jobId and status required' })

    const job = MOCK_JOBS.find(j => j.id === jobId)
    if (!job) return reply.code(404).send({ error: 'Job not found' })

    const existing = store.applications.findIndex(a => a.jobId === jobId)
    const now = new Date().toISOString()

    if (existing >= 0) {
      store.applications[existing].status = status
      store.applications[existing].updatedAt = now
      store.applications[existing].timeline.push({ status, at: now })
    } else {
      store.applications.push({
        jobId,
        job,
        status,
        appliedAt: now,
        updatedAt: now,
        timeline: [{ status, at: now }]
      })
    }

    return { ok: true }
  })

  // Get all applications
  app.get('/applications', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    return { applications: store.applications }
  })

  // Update application status
  app.patch('/applications/:jobId', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const { status } = req.body
    const app_idx = store.applications.findIndex(a => a.jobId === req.params.jobId)
    if (app_idx < 0) return reply.code(404).send({ error: 'Application not found' })

    const now = new Date().toISOString()
    store.applications[app_idx].status = status
    store.applications[app_idx].updatedAt = now
    store.applications[app_idx].timeline.push({ status, at: now })
    return { ok: true }
  })

  // Delete application
  app.delete('/applications/:jobId', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    store.applications = store.applications.filter(a => a.jobId !== req.params.jobId)
    return { ok: true }
  })
}
