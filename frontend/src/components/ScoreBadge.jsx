import React from 'react'

export function ScoreBadge({ score, size = 'md', showBar = false }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#64748b'
  const bg = score >= 70 ? 'rgba(16,185,129,0.12)' : score >= 40 ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.12)'
  const label = score >= 70 ? 'Great match' : score >= 40 ? 'Fair match' : 'Weak match'

  const px = size === 'lg' ? '0.6rem 1rem' : '0.3rem 0.6rem'
  const fs = size === 'lg' ? '0.9rem' : '0.75rem'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
      <div style={{
        background: bg,
        border: `1px solid ${color}40`,
        borderRadius: '99px',
        padding: px,
        color,
        fontSize: fs,
        fontWeight: '700',
        fontFamily: 'var(--mono)',
        display: 'flex', alignItems: 'center', gap: '5px',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '0.6em' }}>●</span>
        {score}%
      </div>
      {showBar && (
        <div style={{ width: '100%', height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${score}%`,
            background: color,
            borderRadius: '2px',
            transition: 'width 0.8s ease'
          }} />
        </div>
      )}
    </div>
  )
}

export function ScoreRing({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#64748b'
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
      <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color, lineHeight: 1, fontFamily: 'var(--mono)' }}>
          {score}
        </span>
      </div>
    </div>
  )
}
