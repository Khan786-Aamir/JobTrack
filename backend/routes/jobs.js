import { store } from '../store.js'
import { MOCK_JOBS } from '../data/jobs.js'

export default async function jobRoutes(app) {
  app.get('/jobs', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    let jobs = [...MOCK_JOBS]
    const { search, type, workMode, location, skills, days, minScore } = req.query

    if (search) {
      const q = search.toLowerCase()
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      )
    }
    if (type && type !== 'all') jobs = jobs.filter(j => j.type === type)
    if (workMode && workMode !== 'all') jobs = jobs.filter(j => j.workMode === workMode)
    if (location) jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()))
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim().toLowerCase())
      jobs = jobs.filter(j =>
        skillList.some(s => j.skills.some(js => js.toLowerCase().includes(s)))
      )
    }
    if (days) {
      const cutoff = new Date(Date.now() - parseInt(days) * 86400000)
      jobs = jobs.filter(j => new Date(j.postedAt) >= cutoff)
    }

    return { jobs, total: jobs.length }
  })

  app.get('/jobs/:id', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    const job = MOCK_JOBS.find(j => j.id === req.params.id)
    if (!job) return reply.code(404).send({ error: 'Job not found' })
    return job
  })
}
