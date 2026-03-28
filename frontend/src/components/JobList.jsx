import React from 'react'
import { useStore } from '../store/index.js'
import JobCard from './JobCard.jsx'

export default function JobList({ loading }) {
  const { jobs, filters, scores, resume } = useStore()

  let filtered = [...jobs]

  // Client-side min score filter
  if (filters.minScore > 0 && Object.keys(scores).length > 0) {
    filtered = filtered.filter(j => (scores[j.id]?.score || 0) >= filters.minScore)
  }

  if (loading) {
    return (
      <div style={styles.wrap}>
        <div style={styles.header}>
          <div style={styles.skeleton1} className="skeleton" />
        </div>
        <div style={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={styles.skelCard} className="skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div style={styles.wrap}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>No jobs found</h3>
          <p style={styles.emptySub}>Try adjusting your filters or search terms.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h2 style={styles.heading}>All Jobs</h2>
        <span style={styles.count}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>
      <div style={styles.grid}>
        {filtered.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrap: { padding: '1.5rem', flex: 1 },
  header: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    marginBottom: '1rem'
  },
  heading: {
    fontSize: '1.1rem', fontWeight: '700',
    letterSpacing: '-0.02em'
  },
  count: {
    fontSize: '0.75rem', color: 'var(--text3)',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    padding: '0.2rem 0.6rem',
    borderRadius: '99px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1rem'
  },
  skeleton1: { width: '120px', height: '24px', borderRadius: '6px' },
  skelCard: { height: '220px', borderRadius: 'var(--radius)' },
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '4rem', textAlign: 'center',
    minHeight: '300px'
  },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' },
  emptySub: { color: 'var(--text2)', fontSize: '0.875rem' }
}
