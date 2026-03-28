import { store } from '../store.js'
import { MOCK_JOBS } from '../data/jobs.js'

// LangGraph-style intent detection + routing
const INTENTS = {
  SEARCH_JOBS: 'search_jobs',
  SHOW_REMOTE: 'show_remote',
  SHOW_MATCHES: 'show_matches',
  SHOW_APPLICATIONS: 'show_applications',
  FILTER_BY_SKILL: 'filter_by_skill',
  FILTER_BY_LOCATION: 'filter_by_location',
  GENERAL_QUESTION: 'general_question',
  RESUME_HELP: 'resume_help'
}

function detectIntent(message) {
  const msg = message.toLowerCase()

  if (msg.match(/remote|work from home|wfh/)) return INTENTS.SHOW_REMOTE
  if (msg.match(/best match|top match|highest score|recommend/)) return INTENTS.SHOW_MATCHES
  if (msg.match(/appli(ed|cation|cations)|tracker|dashboard/)) return INTENTS.SHOW_APPLICATIONS
  if (msg.match(/resume|cv|upload|improve/)) return INTENTS.RESUME_HELP
  if (msg.match(/show|find|search|look for|looking for|jobs?/)) {
    const skillMatch = msg.match(/react|python|node|typescript|java|golang|swift|flutter|kubernetes|aws/i)
    const locMatch = msg.match(/in ([a-z\s]+)(,|$)/)
    if (skillMatch) return INTENTS.FILTER_BY_SKILL
    if (locMatch) return INTENTS.FILTER_BY_LOCATION
    return INTENTS.SEARCH_JOBS
  }

  return INTENTS.GENERAL_QUESTION
}

function extractSkills(message) {
  const allSkills = ['React', 'Python', 'Node.js', 'TypeScript', 'JavaScript', 'Java',
    'Go', 'Swift', 'Flutter', 'Kubernetes', 'AWS', 'Docker', 'SQL', 'GraphQL',
    'PostgreSQL', 'Redis', 'Next.js', 'Vue', 'Angular', 'Machine Learning', 'PyTorch']
  return allSkills.filter(s => message.toLowerCase().includes(s.toLowerCase()))
}

function extractWorkMode(message) {
  const msg = message.toLowerCase()
  if (msg.includes('remote')) return 'remote'
  if (msg.includes('onsite') || msg.includes('on-site') || msg.includes('in-office')) return 'onsite'
  if (msg.includes('hybrid')) return 'hybrid'
  return null
}

async function callClaude(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

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
        max_tokens: 500,
        system: `You are a helpful job search assistant. You help users find jobs, understand their matches, and manage their applications. Be concise and friendly. The user is using a job tracker app.`,
        messages
      })
    })
    const data = await res.json()
    return data.content?.[0]?.text || null
  } catch (e) {
    return null
  }
}

// LangGraph-style node execution
async function executeNode(intent, message, history) {
  const resumeLoaded = !!store.resume
  let jobs = [...MOCK_JOBS]
  let filterUpdate = null
  let response = ''

  switch (intent) {
    case INTENTS.SHOW_REMOTE: {
      const skills = extractSkills(message)
      filterUpdate = { workMode: 'remote', skills: skills.join(',') }
      const count = jobs.filter(j => j.workMode === 'remote').length
      response = `Found ${count} remote jobs${skills.length ? ` with ${skills.join(', ')}` : ''}. Filters updated! ✓`
      break
    }

    case INTENTS.FILTER_BY_SKILL: {
      const skills = extractSkills(message)
      const workMode = extractWorkMode(message)
      filterUpdate = { skills: skills.join(','), ...(workMode && { workMode }) }
      const matched = jobs.filter(j => skills.some(s => j.skills.some(js => js.toLowerCase() === s.toLowerCase())))
      response = skills.length
        ? `Showing ${matched.length} jobs matching ${skills.join(', ')}. Filters applied! ✓`
        : "I'll search all jobs. Could you specify a skill? e.g., 'Show React jobs'"
      break
    }

    case INTENTS.FILTER_BY_LOCATION: {
      const locMatch = message.match(/in ([a-zA-Z\s,]+)/i)
      const location = locMatch ? locMatch[1].trim() : ''
      filterUpdate = { location }
      response = location
        ? `Filtering jobs in ${location}. ✓`
        : "Which location are you looking for? e.g., 'Jobs in New York'"
      break
    }

    case INTENTS.SHOW_MATCHES: {
      if (!resumeLoaded) {
        response = "Upload your resume first so I can score and rank jobs by how well they match your profile! 📄"
      } else {
        filterUpdate = { sortBy: 'score' }
        response = "Sorting jobs by match score! The Best Matches section at the top shows your top picks. 🎯"
      }
      break
    }

    case INTENTS.SHOW_APPLICATIONS: {
      const count = store.applications.length
      filterUpdate = { view: 'dashboard' }
      response = count
        ? `You have ${count} tracked application${count > 1 ? 's' : ''}. Switching to your dashboard! 📊`
        : "You haven't applied to any jobs yet. Browse jobs and click Apply to get started!"
      break
    }

    case INTENTS.RESUME_HELP: {
      if (resumeLoaded) {
        response = `Your resume "${store.resume.filename}" is loaded. Jobs are being matched against it automatically. Want me to find your best matches?`
      } else {
        response = "No resume found! Click **Upload Resume** in the sidebar to upload a PDF or TXT file. Once uploaded, every job will get a match score! 📄"
      }
      break
    }

    case INTENTS.SEARCH_JOBS: {
      const searchMatch = message.match(/(?:find|show|search|looking for)\s+(.+?)(?:\s+jobs?)?$/i)
      const query = searchMatch ? searchMatch[1] : ''
      filterUpdate = query ? { search: query } : {}
      response = query
        ? `Searching for "${query}" jobs now! ✓`
        : "Showing all available jobs! Use filters on the left to narrow down. 🔍"
      break
    }

    default: {
      // Fall through to Claude for general questions
      const aiReply = await callClaude([
        ...history.slice(-4),
        { role: 'user', content: message }
      ])
      response = aiReply || "I can help you find jobs, filter by skills, check your applications, or answer resume questions. Try: 'Show remote React jobs' or 'What are my best matches?'"
      break
    }
  }

  return { response, filterUpdate, intent }
}

export default async function assistantRoutes(app) {
  app.post('/assistant', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !store.sessions.has(token)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const { message, history = [] } = req.body
    if (!message?.trim()) return reply.code(400).send({ error: 'Message required' })

    const intent = detectIntent(message)
    const result = await executeNode(intent, message, history)

    return {
      message: result.response,
      intent: result.intent,
      filterUpdate: result.filterUpdate || null,
      timestamp: new Date().toISOString()
    }
  })
}
