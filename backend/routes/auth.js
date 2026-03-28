import { store } from '../store.js'
import crypto from 'crypto'

const CREDENTIALS = { email: 'test@gmail.com', password: 'test@123' }

export default async function authRoutes(app) {
  app.post('/login', async (req, reply) => {
    const { email, password } = req.body
    if (email !== CREDENTIALS.email || password !== CREDENTIALS.password) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }
    const token = crypto.randomBytes(32).toString('hex')
    store.sessions.add(token)
    return { token, user: { email, name: 'Test User' } }
  })

  app.post('/logout', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) store.sessions.delete(token)
    return { ok: true }
  })

  app.get('/me', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    return { user: { email: CREDENTIALS.email, name: 'Test User' } }
  })
}
