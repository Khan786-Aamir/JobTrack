import React from 'react'
import { useStore } from '../store/index.js'
import { ScoreRing } from './ScoreBadge.jsx'

export default function BestMatches() {
  const { jobs, scores, resume, setApplyPopup, matchingAll } = useStore()

  if (!resume) return null

  const scored = jobs
    .map(j => ({ job: j, score: scores[j.id] }))
    .filter(x => x.score)
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, 8)

  if (matchingAll && scored.length === 0) {
    return (
      <div style={styles.section}>
        <div style={styles.header}>
          <h2 style={styles.heading}>✨ Best Matches</h2>
          <span style={styles.analyzing}>Analyzing your resume…</span>
        </div>
        <div style={styles.row}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={styles.skelCard} className="skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (scored.length === 0) return null

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.heading}>✨ Best Matches</h2>
        <span style={styles.badge}>{scored.length} top picks</span>
      </div>
      <div style={styles.row}>
        {scored.map(({ job, score }, idx) => (
          <BestCard key={job.id} job={job} scoreData={score} rank={idx + 1} onApply={() => {
            window.open(job.applyUrl, '_blank', 'noopener')
            setTimeout(() => setApplyPopup(job), 1000)
          }} />
        ))}
      </div>
    </div>
  )
}

function BestCard({ job, scoreData, rank, onApply }) {
  const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32']
  const rankColor = rankColors[rank - 1] || 'var(--text3)'

  return (
    <div style={styles.card} className="fade-in">
      <div style={styles.cardTop}>
        <div style={{ ...styles.rank, color: rankColor }}>#{rank}</div>
        <ScoreRing score={scoreData.score} />
      </div>
      <div style={styles.companyLogo}>
        {job.company[0]}
      </div>
      <div style={styles.jobTitle}>{job.title}</div>
      <div style={styles.company}>{job.company}</div>
      <div style={styles.location}>{job.location} · {job.workMode}</div>
      <div style={styles.skills}>
        {job.skills.slice(0, 3).map(s => (
          <span key={s} style={styles.skill}>{s}</span>
        ))}
      </div>
      {scoreData.skillsMatch && (
        <div style={styles.insight}>{scoreData.skillsMatch}</div>
      )}
      <button style={styles.btn} onClick={onApply}>Apply ↗</button>
    </div>
  )
}

const styles = {
  section: {
    padding: '1.5rem 1.5rem 0',
    borderBottom: '1px solid var(--border)'
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    marginBottom: '1rem'
  },
  heading: {
    fontSize: '1.1rem', fontWeight: '700',
    letterSpacing: '-0.02em'
  },
  analyzing: {
    fontSize: '0.75rem', color: '#3b82f6',
    animation: 'pulse 1.5s ease infinite'
  },
  badge: {
    fontSize: '0.75rem', color: 'var(--text3)',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    padding: '0.2rem 0.6rem',
    borderRadius: '99px'
  },
  row: {
    display: 'flex', gap: '1rem',
    overflowX: 'auto', paddingBottom: '1.25rem',
    scrollbarWidth: 'none'
  },
  card: {
    minWidth: '210px', maxWidth: '210px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
    flexShrink: 0,
    transition: 'border-color 0.2s, transform 0.2s'
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '0.25rem'
  },
  rank: { fontSize: '0.75rem', fontWeight: '700', fontFamily: 'var(--mono)' },
  companyLogo: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: '700', color: '#fff'
  },
  jobTitle: {
    fontSize: '0.875rem', fontWeight: '600',
    lineHeight: 1.3, letterSpacing: '-0.01em'
  },
  company: { fontSize: '0.78rem', color: 'var(--text2)' },
  location: { fontSize: '0.7rem', color: 'var(--text3)' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' },
  skill: {
    fontSize: '0.65rem',
    padding: '0.15rem 0.4rem',
    background: 'var(--accent-glow)',
    color: '#3b82f6',
    borderRadius: '4px',
    fontFamily: 'var(--mono)'
  },
  insight: {
    fontSize: '0.7rem', color: 'var(--text3)', lineHeight: 1.5,
    borderTop: '1px solid var(--border)',
    paddingTop: '0.4rem', marginTop: '0.25rem'
  },
  btn: {
    marginTop: 'auto',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    padding: '0.45rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.775rem', fontWeight: '600',
    cursor: 'pointer', border: 'none',
    width: '100%'
  },
  skelCard: {
    minWidth: '210px', height: '260px',
    borderRadius: 'var(--radius)', flexShrink: 0
  }
}
