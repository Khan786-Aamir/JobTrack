// In-memory store — replace with DB in production
export const store = {
  resume: null,        // { text: string, filename: string, uploadedAt: string }
  applications: [],   // [{ jobId, job, status, appliedAt, updatedAt }]
  sessions: new Set() // active session tokens
}
