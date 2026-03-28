import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Auth
  user: null,
  token: localStorage.getItem('jt_token'),
  setAuth: (user, token) => {
    localStorage.setItem('jt_token', token)
    set({ user, token })
  },
  clearAuth: () => {
    localStorage.removeItem('jt_token')
    set({ user: null, token: null })
  },

  // Resume
  resume: null,
  setResume: (resume) => set({ resume }),

  // Jobs
  jobs: [],
  setJobs: (jobs) => set({ jobs }),

  // Scores — { [jobId]: { score, skillsMatch, experienceMatch, keywordMatch, summary } }
  scores: {},
  setScore: (jobId, data) => set(s => ({ scores: { ...s.scores, [jobId]: data } })),
  setAllScores: (scores) => set({ scores }),

  // Filters
  filters: {
    search: '',
    type: 'all',
    workMode: 'all',
    location: '',
    skills: '',
    days: '',
    minScore: 0
  },
  setFilter: (key, value) => set(s => ({ filters: { ...s.filters, [key]: value } })),
  setFilters: (patch) => set(s => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: { search: '', type: 'all', workMode: 'all', location: '', skills: '', days: '', minScore: 0 } }),

  // Applications
  applications: [],
  setApplications: (applications) => set({ applications }),

  // UI
  view: 'jobs', // 'jobs' | 'dashboard'
  setView: (view) => set({ view }),

  // Apply popup
  applyPopup: null, // { job }
  setApplyPopup: (job) => set({ applyPopup: job ? { job } : null }),

  // Loading
  matchingAll: false,
  setMatchingAll: (v) => set({ matchingAll: v }),
}))
