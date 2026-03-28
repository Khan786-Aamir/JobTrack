import React, { useState } from 'react'
import { useStore } from '../store/index.js'
import { api } from '../utils/api.js'
import { formatDistanceToNow, format } from 'date-fns'

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected']
const STATUS_COLORS = {
  Applied: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: '📤' },
  Interview: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: '🗓' },
  Offer: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '🎉' },
  Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '❌' },
  'Applied Earlier': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '📌' }
}

export default function ApplicationDashboard() {
  const { applications, setApplications } = useStore()
  const [view, setView] = useState('kanban') // 'kanban' | 'timeline'

  async function updateStatus(jobId, status) {
    try {
      await api.updateApplication(jobId, status)
      const { applications: apps } = await api.getApplications()
      setApplications(apps)
    } catch (e) { console.error(e) }
  }

  async function deleteApp(jobId) {
    if (!confirm('Remove this application?')) return
    try {
      await api.deleteApplication(jobId)
      const { applications: apps } = await api.getApplications()
      setApplications(apps)
    } catch (e) { console.error(e) }
  }

  // Stats
  const stats = STATUSES.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s || a.status === s).length
    return acc
  }, {})

  if (applications.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>📋</div>
        <h2 style={styles.emptyTitle}>No applications yet</h2>
        <p style={styles.emptySub}>Browse jobs and click Apply to start tracking your applications.</p>
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Application Tracker</h1>
          <p style={styles.sub}>{applications.length} application{applications.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <div style={styles.viewToggle}>
          <button
            style={{ ...styles.toggleBtn, ...(view === 'kanban' ? styles.toggleActive : {}) }}
            onClick={() => setView('kanban')}
          >
            ▦ Kanban
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(view === 'timeline' ? styles.toggleActive : {}) }}
            onClick={() => setView('timeline')}
          >
            ≡ Timeline
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        {STATUSES.map(s => {
          const st = STATUS_COLORS[s]
          const count = applications.filter(a => a.status === s).length
          return (
            <div key={s} style={{ ...styles.statCard, borderColor: `${st.color}30` }}>
              <div style={styles.statIcon}>{st.icon}</div>
              <div style={{ ...styles.statCount, color: st.color }}>{count}</div>
              <div style={styles.statLabel}>{s}</div>
            </div>
          )
        })}
      </div>

      {view === 'kanban' ? (
        <KanbanView applications={applications} onUpdate={updateStatus} onDelete={deleteApp} />
      ) : (
        <TimelineView applications={applications} onUpdate={updateStatus} onDelete={deleteApp} />
      )}
    </div>
  )
}

function KanbanView({ applications, onUpdate, onDelete }) {
  return (
    <div style={styles.kanban}>
      {STATUSES.map(status => {
        const col = applications.filter(a => a.status === status)
        const st = STATUS_COLORS[status]
        return (
          <div key={status} style={styles.column}>
            <div style={styles.colHeader}>
              <span style={{ color: st.color }}>{st.icon}</span>
              <span style={styles.colTitle}>{status}</span>
              <span style={{ ...styles.colCount, background: st.bg, color: st.color }}>
                {col.length}
              </span>
            </div>
            <div style={styles.colCards}>
              {col.map(app => (
                <AppCard
                  key={app.jobId}
                  app={app}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
              {col.length === 0 && (
                <div style={styles.emptyCol}>Drop cards here</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AppCard({ app, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false)
  const st = STATUS_COLORS[app.status] || STATUS_COLORS['Applied']

  return (
    <div style={styles.appCard} className="fade-in">
      <div style={styles.appCardTop}>
        <div style={styles.appCompany}>{app.job.company[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.appTitle}>{app.job.title}</div>
          <div style={styles.appCompanyName}>{app.job.company}</div>
        </div>
        <button style={styles.deleteBtn} onClick={() => onDelete(app.jobId)}>✕</button>
      </div>
      <div style={styles.appMeta}>
        <span style={styles.appLocation}>{app.job.location}</span>
        <span style={styles.appDate}>
          {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
        </span>
      </div>
      <div style={styles.statusRow}>
        <select
          value={app.status}
          onChange={e => onUpdate(app.jobId, e.target.value)}
          style={{ ...styles.statusSelect, color: st.color, borderColor: `${st.color}40`, background: st.bg }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}

function TimelineView({ applications, onUpdate, onDelete }) {
  const sorted = [...applications].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  return (
    <div style={styles.timeline}>
      {sorted.map(app => {
        const st = STATUS_COLORS[app.status] || STATUS_COLORS['Applied']
        return (
          <div key={app.jobId} style={styles.timelineItem} className="fade-in">
            {/* Line */}
            <div style={styles.timelineLine} />
            {/* Dot */}
            <div style={{ ...styles.timelineDot, background: st.color, boxShadow: `0 0 0 4px ${st.bg}` }}>
              {st.icon}
            </div>

            {/* Content */}
            <div style={styles.timelineContent}>
              <div style={styles.timelineHeader}>
                <div>
                  <div style={styles.appTitle}>{app.job.title}</div>
                  <div style={styles.appCompanyName}>
                    {app.job.company} · {app.job.location}
                  </div>
                </div>
                <button style={styles.deleteBtn} onClick={() => onDelete(app.jobId)}>✕</button>
              </div>

              {/* Mini timeline of status changes */}
              <div style={styles.miniTimeline}>
                {app.timeline?.map((t, i) => {
                  const tst = STATUS_COLORS[t.status] || STATUS_COLORS['Applied']
                  return (
                    <div key={i} style={styles.miniTimelineItem}>
                      <span style={{ color: tst.color, fontSize: '0.75rem' }}>●</span>
                      <span style={styles.miniStatus}>{t.status}</span>
                      <span style={styles.miniDate}>
                        {format(new Date(t.at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem' }}>
                <select
                  value={app.status}
                  onChange={e => onUpdate(app.jobId, e.target.value)}
                  style={{ ...styles.statusSelect, color: st.color, borderColor: `${st.color}40`, background: st.bg }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={styles.appDate}>
                  Last update {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  wrap: { padding: '1.5rem', overflowY: 'auto', flex: 1 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },
  title: { fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.03em' },
  sub: { color: 'var(--text2)', fontSize: '0.875rem', marginTop: '0.2rem' },
  viewToggle: { display: 'flex', gap: '4px', background: 'var(--surface2)', padding: '4px', borderRadius: 'var(--radius-sm)' },
  toggleBtn: {
    padding: '0.375rem 0.875rem',
    borderRadius: '6px',
    background: 'none',
    color: 'var(--text2)',
    fontSize: '0.8rem', fontWeight: '500',
    cursor: 'pointer', border: 'none'
  },
  toggleActive: {
    background: 'var(--surface)',
    color: 'var(--text)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem', marginBottom: '1.5rem'
  },
  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem',
    textAlign: 'center'
  },
  statIcon: { fontSize: '1.25rem', marginBottom: '0.4rem' },
  statCount: { fontSize: '1.75rem', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.04em' },
  statLabel: { fontSize: '0.72rem', color: 'var(--text3)', marginTop: '0.25rem' },

  // Kanban
  kanban: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem', alignItems: 'start'
  },
  column: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden'
  },
  colHeader: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '0.875rem 1rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)'
  },
  colTitle: { flex: 1, fontSize: '0.85rem', fontWeight: '600' },
  colCount: {
    fontSize: '0.7rem', fontWeight: '700',
    padding: '2px 8px', borderRadius: '99px'
  },
  colCards: {
    padding: '0.75rem',
    display: 'flex', flexDirection: 'column', gap: '0.625rem',
    minHeight: '120px'
  },
  emptyCol: {
    textAlign: 'center', color: 'var(--text3)',
    fontSize: '0.75rem', padding: '1.5rem 0',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-sm)'
  },

  appCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.875rem',
    display: 'flex', flexDirection: 'column', gap: '0.5rem'
  },
  appCardTop: { display: 'flex', alignItems: 'center', gap: '8px' },
  appCompany: {
    width: '30px', height: '30px', flexShrink: 0,
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '7px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: '700', color: '#fff'
  },
  appTitle: { fontSize: '0.83rem', fontWeight: '600', lineHeight: 1.3 },
  appCompanyName: { fontSize: '0.72rem', color: 'var(--text2)' },
  deleteBtn: {
    background: 'none', border: 'none',
    color: 'var(--text3)', fontSize: '0.75rem',
    cursor: 'pointer', padding: '2px 4px',
    marginLeft: 'auto', flexShrink: 0
  },
  appMeta: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  appLocation: { fontSize: '0.7rem', color: 'var(--text3)' },
  appDate: { fontSize: '0.68rem', color: 'var(--text3)' },
  statusRow: { display: 'flex', gap: '8px' },
  statusSelect: {
    padding: '0.35rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    fontSize: '0.75rem', fontWeight: '600',
    cursor: 'pointer',
    appearance: 'none',
    fontFamily: 'var(--font)'
  },

  // Timeline
  timeline: {
    display: 'flex', flexDirection: 'column', gap: '0',
    position: 'relative', paddingLeft: '3rem'
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: '1.5rem'
  },
  timelineLine: {
    position: 'absolute', left: '-2rem',
    top: '1.5rem', bottom: 0,
    width: '1px', background: 'var(--border)'
  },
  timelineDot: {
    position: 'absolute', left: '-2.45rem', top: '0',
    width: '2rem', height: '2rem',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', flexShrink: 0
  },
  timelineContent: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem'
  },
  timelineHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '0.75rem'
  },
  miniTimeline: {
    display: 'flex', flexDirection: 'column', gap: '0.25rem'
  },
  miniTimelineItem: {
    display: 'flex', alignItems: 'center', gap: '8px'
  },
  miniStatus: { fontSize: '0.75rem', fontWeight: '600', color: 'var(--text)' },
  miniDate: { fontSize: '0.7rem', color: 'var(--text3)' },

  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', padding: '4rem', textAlign: 'center'
  },
  emptyIcon: { fontSize: '3.5rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' },
  emptySub: { color: 'var(--text2)', fontSize: '0.875rem', maxWidth: '360px' }
}
