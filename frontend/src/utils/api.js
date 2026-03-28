const BASE = '/api'

function getToken() {
  return localStorage.getItem('jt_token') || ''
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  }
}

async function req(method, path, body, customHeaders) {
  const res = await fetch(BASE + path, {
    method,
    headers: customHeaders || authHeaders(),
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 401) {
    localStorage.removeItem('jt_token')
    window.location.href = '/login'
    return
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  login: (email, password) =>
    req('POST', '/login', { email, password }, { 'Content-Type': 'application/json' }),

  logout: () => req('POST', '/logout'),

  me: () => req('GET', '/me'),

  uploadResume: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(BASE + '/upload-resume', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form
    })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },

  getResume: () => req('GET', '/resume'),
  deleteResume: () => req('DELETE', '/resume'),

  getJobs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v && v !== 'all' && v !== '')
    ).toString()
    return req('GET', `/jobs${qs ? '?' + qs : ''}`)
  },

  matchJob: (jobId) => req('POST', '/match', { jobId }),
  matchAll: () => req('POST', '/match-all', {}),

  applyJob: (jobId, status) => req('POST', '/apply', { jobId, status }),
  getApplications: () => req('GET', '/applications'),
  updateApplication: (jobId, status) => req('PATCH', `/applications/${jobId}`, { status }),
  deleteApplication: (jobId) => req('DELETE', `/applications/${jobId}`),

  assistant: (message, history) => req('POST', '/assistant', { message, history })
}
