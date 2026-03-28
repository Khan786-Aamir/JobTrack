import React, { useRef, useState } from 'react'
import { useStore } from '../store/index.js'
import { api } from '../utils/api.js'
import { useNavigate } from 'react-router-dom'

export default function Sidebar({ onMatchAll }) {
  const { user, clearAuth, resume, setResume, view, setView, applications, matchingAll, scores } = useStore()
  const navigate = useNavigate()
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  async function handleLogout() {
    await api.logout().catch(() => {})
    clearAuth()
    navigate('/login')
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    try {
      const data = await api.uploadResume(file)
      setResume(data)
      setUploadMsg('✓ Resume uploaded!')
      setTimeout(() => setUploadMsg(''), 3000)
    } catch (err) {
      setUploadMsg('✗ Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteResume() {
    await api.deleteResume()
    setResume(null)
  }

  const matchedCount = Object.values(scores).filter(s => s.score >= 70).length
  const avgScore = Object.values(scores).length
    ? Math.round(Object.values(scores).reduce((a, b) => a + b.score, 0) / Object.values(scores).length)
    : null

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>⚡</div>
        <div style={styles.logoText}>
          <span style={{ color: '#3b82f6' }}>Job</span>Track AI
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <NavItem
          icon="🔍" label="Job Feed"
          active={view === 'jobs'}
          onClick={() => setView('jobs')}
          badge={null}
        />
        <NavItem
          icon="📋" label="Applications"
          active={view === 'dashboard'}
          onClick={() => setView('dashboard')}
          badge={applications.length || null}
        />
      </nav>

      <div style={styles.divider} />

      {/* Resume section */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Resume</div>
        {resume ? (
          <div style={styles.resumeCard}>
            <div style={styles.resumeIcon}>📄</div>
            <div style={styles.resumeInfo}>
              <div style={styles.resumeName}>{resume.filename}</div>
              <div style={styles.resumeMeta}>
                {resume.size ? `${(resume.size / 1024).toFixed(1)} KB` : 'Loaded'}
              </div>
            </div>
            <button
              onClick={handleDeleteResume}
              style={styles.resumeDelete}
              title="Remove resume"
            >✕</button>
          </div>
        ) : (
          <div style={styles.uploadZone} onClick={() => fileRef.current?.click()}>
            <div style={styles.uploadIcon}>📄</div>
            <div style={styles.uploadText}>
              {uploading ? 'Uploading…' : 'Upload PDF or TXT'}
            </div>
            <div style={styles.uploadSub}>Click to browse</div>
          </div>
        )}

        {resume && (
          <button
            style={styles.replaceBtn}
            onClick={() => fileRef.current?.click()}
          >
            Replace Resume
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {uploadMsg && (
          <div style={{
            fontSize: '0.75rem', marginTop: '0.5rem',
            color: uploadMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)'
          }}>
            {uploadMsg}
          </div>
        )}
      </div>

      <div style={styles.divider} />

      {/* AI Match section */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>AI Matching</div>
        {avgScore !== null && (
          <div style={styles.statsRow}>
            <Stat label="Avg Score" value={`${avgScore}%`} color="#3b82f6" />
            <Stat label="Good Fits" value={matchedCount} color="#10b981" />
          </div>
        )}
        <button
          style={{
            ...styles.matchBtn,
            opacity: (!resume || matchingAll) ? 0.5 : 1
          }}
          onClick={onMatchAll}
          disabled={!resume || matchingAll}
        >
          {matchingAll ? (
            <><span style={styles.btnSpinner} /> Matching…</>
          ) : (
            <><span>✨</span> Match All Jobs</>
          )}
        </button>
        {!resume && (
          <div style={styles.matchHint}>Upload resume to enable AI matching</div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User */}
      <div style={styles.userRow}>
        <div style={styles.avatar}>
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name || 'Test User'}</div>
          <div style={styles.userEmail}>{user?.email}</div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
          ↩
        </button>
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}>
      <span>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      {badge && <span style={styles.badge}>{badge}</span>}
    </button>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '260px',
    minWidth: '260px',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    gap: '0',
    overflowY: 'auto',
    height: '100vh'
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '1.75rem', padding: '0.25rem 0'
  },
  logoIcon: {
    width: '32px', height: '32px',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px'
  },
  logoText: { fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.02em' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1rem' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '0.6rem 0.875rem',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--text2)',
    fontSize: '0.875rem', fontWeight: '500',
    transition: 'all 0.15s',
    width: '100%', cursor: 'pointer'
  },
  navItemActive: {
    background: 'var(--accent-glow)',
    color: 'var(--accent)',
  },
  badge: {
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '99px',
    minWidth: '20px',
    textAlign: 'center'
  },
  divider: {
    height: '1px', background: 'var(--border)',
    margin: '0.75rem 0'
  },
  section: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' },
  sectionLabel: {
    fontSize: '0.7rem', fontWeight: '600',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--text3)', marginBottom: '0.25rem'
  },
  resumeCard: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.6rem 0.75rem'
  },
  resumeIcon: { fontSize: '1.1rem' },
  resumeInfo: { flex: 1, minWidth: 0 },
  resumeName: {
    fontSize: '0.78rem', fontWeight: '500',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    color: 'var(--text)'
  },
  resumeMeta: { fontSize: '0.7rem', color: 'var(--text3)' },
  resumeDelete: {
    background: 'none', color: 'var(--text3)',
    fontSize: '0.75rem', padding: '2px 4px',
    borderRadius: '4px', cursor: 'pointer',
    transition: 'color 0.15s'
  },
  uploadZone: {
    border: '1.5px dashed var(--border2)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s'
  },
  uploadIcon: { fontSize: '1.5rem', marginBottom: '0.4rem' },
  uploadText: { fontSize: '0.8rem', color: 'var(--text)', fontWeight: '500' },
  uploadSub: { fontSize: '0.7rem', color: 'var(--text3)' },
  replaceBtn: {
    background: 'none',
    border: '1px solid var(--border2)',
    color: 'var(--text2)',
    fontSize: '0.75rem',
    padding: '0.4rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  },
  statsRow: { display: 'flex', gap: '8px' },
  stat: {
    flex: 1, background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.6rem', textAlign: 'center'
  },
  statValue: { fontSize: '1.1rem', fontWeight: '700', lineHeight: 1 },
  statLabel: { fontSize: '0.65rem', color: 'var(--text3)', marginTop: '2px' },
  matchBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    padding: '0.625rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.825rem', fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    border: 'none'
  },
  btnSpinner: {
    display: 'inline-block',
    width: '14px', height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite'
  },
  matchHint: {
    fontSize: '0.7rem', color: 'var(--text3)',
    textAlign: 'center', lineHeight: 1.4
  },
  userRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '0.75rem',
    background: 'var(--surface2)',
    borderRadius: 'var(--radius-sm)',
    marginTop: '0.5rem'
  },
  avatar: {
    width: '32px', height: '32px',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: '700', color: '#fff',
    flexShrink: 0
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: '0.8rem', fontWeight: '600', lineHeight: 1.2 },
  userEmail: {
    fontSize: '0.7rem', color: 'var(--text3)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
  },
  logoutBtn: {
    background: 'none', color: 'var(--text3)',
    fontSize: '1rem', cursor: 'pointer', padding: '4px',
    borderRadius: '4px', flexShrink: 0
  }
}
