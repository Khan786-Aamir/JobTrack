import React, { useEffect } from 'react'
import { useStore } from '../store/index.js'
import { api } from '../utils/api.js'

const STATUS_OPTIONS = [
  { label: '✅ Yes, Applied!', value: 'Applied', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { label: '⏭ Applied Earlier', value: 'Applied Earlier', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { label: '✕ No, Skip', value: null, color: '#64748b', bg: 'rgba(100,116,139,0.1)' }
]

export default function ApplyPopup() {
  const { applyPopup, setApplyPopup, setApplications } = useStore()

  useEffect(() => {
    const handler = e => e.key === 'Escape' && setApplyPopup(null)
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!applyPopup) return null

  const { job } = applyPopup

  async function handleChoice(status) {
    if (status) {
      try {
        await api.applyJob(job.id, status)
        const { applications } = await api.getApplications()
        setApplications(applications)
      } catch (e) {
        console.error(e)
      }
    }
    setApplyPopup(null)
  }

  return (
    <div style={styles.overlay} onClick={() => setApplyPopup(null)}>
      <div style={styles.popup} onClick={e => e.stopPropagation()} className="fade-in">
        {/* Icon */}
        <div style={styles.iconWrap}>
          <div style={styles.icon}>🎯</div>
        </div>

        <h2 style={styles.title}>Did you apply?</h2>
        <p style={styles.sub}>
          <strong>{job.title}</strong> at <strong>{job.company}</strong>
        </p>

        <div style={styles.options}>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.label}
              style={{ ...styles.optBtn, color: opt.color, background: opt.bg, borderColor: `${opt.color}30` }}
              onClick={() => handleChoice(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button style={styles.closeBtn} onClick={() => setApplyPopup(null)}>✕</button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem'
  },
  popup: {
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: '20px',
    padding: '2rem',
    width: '100%', maxWidth: '380px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative'
  },
  iconWrap: {
    width: '64px', height: '64px',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.25rem',
    fontSize: '1.75rem'
  },
  icon: { lineHeight: 1 },
  title: {
    fontSize: '1.3rem', fontWeight: '700',
    letterSpacing: '-0.02em', marginBottom: '0.5rem'
  },
  sub: {
    color: 'var(--text2)', fontSize: '0.875rem',
    marginBottom: '1.75rem', lineHeight: 1.5
  },
  options: { display: 'flex', flexDirection: 'column', gap: '0.625rem' },
  optBtn: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    fontSize: '0.9rem', fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s'
  },
  closeBtn: {
    position: 'absolute', top: '1rem', right: '1rem',
    background: 'none', border: 'none',
    color: 'var(--text3)', fontSize: '1rem',
    cursor: 'pointer', padding: '4px'
  }
}
