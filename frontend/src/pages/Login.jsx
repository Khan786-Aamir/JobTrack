import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'
import { useStore } from '../store/index.js'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useStore(s => s.setAuth)
  const [email, setEmail] = useState('test@gmail.com')
  const [password, setPassword] = useState('test@123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login(email, password)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card} className="fade-in">
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <div style={styles.logoText}>
            <span style={{ color: '#3b82f6' }}>Job</span>Track AI
          </div>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your account to continue</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="test@gmail.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        <div style={styles.hint}>
          <span>Demo: </span>
          <code style={{ color: '#3b82f6', fontSize: '0.8rem' }}>test@gmail.com / test@123</code>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden'
  },
  bg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative'
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '2rem'
  },
  logoIcon: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px'
  },
  logoText: {
    fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em'
  },
  heading: {
    fontSize: '1.6rem', fontWeight: '700',
    letterSpacing: '-0.03em', marginBottom: '0.4rem'
  },
  sub: { color: 'var(--text2)', fontSize: '0.875rem', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.8rem', color: 'var(--text2)', fontWeight: '500', letterSpacing: '0.02em' },
  input: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem 1rem',
    color: 'var(--text)',
    fontSize: '0.9rem',
    transition: 'border-color 0.2s',
    width: '100%'
  },
  error: {
    background: 'var(--red-bg)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem 1rem',
    color: '#ef4444',
    fontSize: '0.85rem'
  },
  btn: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    padding: '0.875rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'opacity 0.2s, transform 0.1s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', height: '48px'
  },
  spinner: {
    width: '18px', height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite'
  },
  hint: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.8rem',
    color: 'var(--text3)'
  }
}
