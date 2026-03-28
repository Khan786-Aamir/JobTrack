import React, { useState } from 'react'
import { useStore } from '../store/index.js'
import { ScoreBadge, ScoreRing } from './ScoreBadge.jsx'
import { formatDistanceToNow } from 'date-fns'

const MODE_COLORS = {
  remote: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '🌐' },
  hybrid: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🔄' },
  onsite: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: '🏢' }
}

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Interview: '#8b5cf6',
  Offer: '#10b981',
  Rejected: '#ef4444',
  'Applied Earlier': '#f59e0b'
}

export default function JobCard({ job }) {
  const { scores, setApplyPopup, applications, matchingAll, resume } = useStore()
  const [expanded, setExpanded] = useState(false)

  const scoreData = scores[job.id]
  const application = applications.find(a => a.jobId === job.id)
  const modeStyle = MODE_COLORS[job.workMode] || MODE_COLORS.onsite

  const postedAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })

  function handleApply() {
    window.open(job.applyUrl, '_blank', 'noopener')
    setTimeout(() => setApplyPopup(job), 1000)
  }

  return (
    <div style={{
      ...styles.card,
      ...(application ? { borderColor: `${STATUS_COLORS[application.status]}30` } : {})
    }} className="fade-in">
      {/* Top row */}
      <div style={styles.top}>
        <div style={styles.companyLogo}>
          {job.company[0]}
        </div>
        <div style={styles.meta}>
          <div style={styles.titleRow}>
            <h3 style={styles.title}>{job.title}</h3>
            {scoreData ? (
              <ScoreBadge score={scoreData.score} />
            ) : resume && matchingAll ? (
              <div style={styles.scoreSkeleton} className="skeleton" />
            ) : null}
          </div>
          <div style={styles.company}>{job.company}</div>
          <div style={styles.tags}>
            <Tag>{job.location}</Tag>
            <Tag color={modeStyle.color} bg={modeStyle.bg}>
              {modeStyle.icon} {job.workMode}
            </Tag>
            <Tag>{job.type}</Tag>
            {job.salary && <Tag color="#a78bfa" bg="rgba(167,139,250,0.1)">{job.salary}</Tag>}
            <span style={styles.postedAt}>{postedAgo}</span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={styles.skills}>
        {job.skills.map(skill => {
          const matched = scoreData && scores[job.id]?.keywordMatch?.toLowerCase().includes(skill.toLowerCase())
          return (
            <span key={skill} style={{
              ...styles.skill,
              ...(matched ? styles.skillMatched : {})
            }}>
              {skill}
            </span>
          )
        })}
      </div>

      {/* Description */}
      <p style={styles.desc}>
        {expanded ? job.description : job.description.slice(0, 140) + '…'}
        <button style={styles.readMore} onClick={() => setExpanded(e => !e)}>
          {expanded ? ' less ▲' : ' more ▼'}
        </button>
      </p>

      {/* AI Score breakdown */}
      {scoreData && expanded && (
        <div style={styles.scoreBreakdown} className="fade-in">
          <div style={styles.scoreBreakdownTitle}>✨ AI Match Analysis</div>
          <div style={styles.scoreRow}>
            <ScoreRing score={scoreData.score} />
            <div style={styles.scoreDetails}>
              <ScoreLine label="Skills" text={scoreData.skillsMatch} />
              <ScoreLine label="Experience" text={scoreData.experienceMatch} />
              <ScoreLine label="Keywords" text={scoreData.keywordMatch} />
            </div>
          </div>
          {scoreData.summary && (
            <p style={styles.scoreSummary}>{scoreData.summary}</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        {application ? (
          <div style={styles.appliedBadge}>
            <span style={{
              color: STATUS_COLORS[application.status],
              fontWeight: '600', fontSize: '0.8rem'
            }}>
              ● {application.status}
            </span>
          </div>
        ) : (
          <div />
        )}

        <div style={styles.actions}>
          {!application ? (
            <button style={styles.applyBtn} onClick={handleApply}>
              Apply Now ↗
            </button>
          ) : (
            <button style={styles.applyBtnApplied} onClick={handleApply}>
              Apply Again ↗
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Tag({ children, color, bg }) {
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: '500',
      padding: '0.2rem 0.5rem',
      borderRadius: '99px',
      background: bg || 'var(--surface2)',
      color: color || 'var(--text2)',
      border: '1px solid var(--border)',
      whiteSpace: 'nowrap'
    }}>
      {children}
    </span>
  )
}

function ScoreLine({ label, text }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: '600', marginRight: '6px' }}>{label}:</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{text}</span>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.875rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: 'default'
  },
  top: { display: 'flex', gap: '0.875rem', alignItems: 'flex-start' },
  companyLogo: {
    width: '44px', height: '44px', flexShrink: 0,
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', fontWeight: '700', color: '#fff'
  },
  meta: { flex: 1, minWidth: 0 },
  titleRow: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: '0.5rem',
    marginBottom: '0.2rem'
  },
  title: {
    fontSize: '1rem', fontWeight: '600',
    letterSpacing: '-0.01em', lineHeight: 1.3
  },
  company: { fontSize: '0.825rem', color: 'var(--text2)', marginBottom: '0.4rem' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' },
  postedAt: { fontSize: '0.68rem', color: 'var(--text3)', marginLeft: '4px' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' },
  skill: {
    fontSize: '0.7rem', fontWeight: '500',
    padding: '0.2rem 0.5rem',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    color: 'var(--text2)',
    fontFamily: 'var(--mono)'
  },
  skillMatched: {
    background: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.4)',
    color: '#3b82f6'
  },
  desc: {
    fontSize: '0.825rem', color: 'var(--text2)', lineHeight: 1.7
  },
  readMore: {
    background: 'none', border: 'none',
    color: '#3b82f6', fontSize: '0.78rem', cursor: 'pointer',
    fontWeight: '500'
  },
  scoreSkeleton: {
    width: '64px', height: '26px', borderRadius: '99px', flexShrink: 0
  },
  scoreBreakdown: {
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.875rem'
  },
  scoreBreakdownTitle: {
    fontSize: '0.75rem', fontWeight: '600',
    color: '#3b82f6', marginBottom: '0.6rem'
  },
  scoreRow: { display: 'flex', gap: '0.875rem', alignItems: 'center' },
  scoreDetails: { flex: 1 },
  scoreSummary: {
    fontSize: '0.78rem', color: 'var(--text2)',
    lineHeight: 1.6, marginTop: '0.6rem',
    borderTop: '1px solid var(--border)',
    paddingTop: '0.6rem'
  },
  footer: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--border)',
    paddingTop: '0.875rem'
  },
  appliedBadge: {
    display: 'flex', alignItems: 'center', gap: '6px'
  },
  actions: { display: 'flex', gap: '0.5rem' },
  applyBtn: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.825rem', fontWeight: '600',
    cursor: 'pointer', border: 'none',
    transition: 'opacity 0.2s'
  },
  applyBtnApplied: {
    background: 'none',
    color: 'var(--text2)',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.825rem', fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid var(--border2)'
  }
}
