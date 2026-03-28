import { store } from '../store.js'
import { MOCK_JOBS } from '../data/jobs.js'

// Cache scores to avoid repeated API calls
const scoreCache = new Map()

async function matchWithClaude(resumeText, job) {
  const cacheKey = `${job.id}-${resumeText.slice(0, 50)}`
  if (scoreCache.has(cacheKey)) return scoreCache.get(cacheKey)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return generateHeuristicScore(resumeText, job)

  const prompt = `You are an expert recruiter AI. Compare this resume against the job description and return ONLY a JSON object.

RESUME:
${resumeText.slice(0, 2000)}

JOB TITLE: ${job.title}
COMPANY: ${job.company}
JOB DESCRIPTION: ${job.description}
REQUIRED SKILLS: ${job.skills.join(', ')}

Return ONLY this JSON (no markdown, no explanation):
{
  "score": <0-100 integer>,
  "skillsMatch": "<one sentence about matching skills>",
  "experienceMatch": "<one sentence about experience alignment>",
  "keywordMatch": "<key matching keywords found>",
  "summary": "<2 sentence overall assessment>"
}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)
    scoreCache.set(cacheKey, result)
    return result
  } catch (e) {
    console.error('Claude match error:', e.message)
    return generateHeuristicScore(resumeText, job)
  }
}

function generateHeuristicScore(resumeText, job) {
  const resumeLower = resumeText.toLowerCase()
  const matchedSkills = job.skills.filter(s => resumeLower.includes(s.toLowerCase()))
  const skillScore = Math.round((matchedSkills.length / Math.max(job.skills.length, 1)) * 100)

  const titleWords = job.title.toLowerCase().split(/\s+/)
  const titleMatch = titleWords.filter(w => w.length > 3 && resumeLower.includes(w)).length
  const titleScore = Math.round((titleMatch / Math.max(titleWords.length, 1)) * 100)

  const score = Math.round(skillScore * 0.7 + titleScore * 0.3)

  return {
    score: Math.min(95, Math.max(5, score)),
    skillsMatch: matchedSkills.length > 0
      ? `Found ${matchedSkills.length} matching skills: ${matchedSkills.slice(0, 3).join(', ')}`
      : 'No direct skill matches found in resume',
    experienceMatch: score > 60 ? 'Experience appears aligned with the role' : 'Experience gap detected for this level',
    keywordMatch: matchedSkills.join(', ') || 'None detected',
    summary: `Resume matches ${score}% of requirements. ${matchedSkills.length} out of ${job.skills.length} skills detected.`
  }
}

export default async function matchRoutes(app) {
  // Match single job
  app.post('/match', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    if (!store.resume) {
      return reply.code(400).send({ error: 'No resume uploaded' })
    }
    const { jobId } = req.body
    const job = MOCK_JOBS.find(j => j.id === jobId)
    if (!job) return reply.code(404).send({ error: 'Job not found' })

    const result = await matchWithClaude(store.resume.text, job)
    return result
  })

  // Match all jobs — returns scores for all
  app.post('/match-all', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    if (!store.resume) {
      return reply.code(400).send({ error: 'No resume uploaded' })
    }

    const results = {}
    await Promise.all(
      MOCK_JOBS.map(async job => {
        const r = await matchWithClaude(store.resume.text, job)
        results[job.id] = r
      })
    )
    return results
  })
}
