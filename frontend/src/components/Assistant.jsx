import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/index.js'
import { api } from '../utils/api.js'

const SUGGESTIONS = [
  'Show remote React jobs',
  'What are my best matches?',
  'Find Python ML jobs',
  'Show my applications',
  'Find jobs in New York',
  'Show hybrid TypeScript jobs'
]

export default function Assistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI job assistant powered by LangGraph. I can search jobs, apply filters, or answer questions. Try: \"Show remote React jobs\" 🚀"
    }
  ])
  const [loading, setLoading] = useState(false)
  const { setFilters, setView } = useStore()
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    setMessages(m => [...m, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await api.assistant(msg, history)

      // Apply filter updates from LangGraph
      if (res.filterUpdate) {
        const patch = {}
        if (res.filterUpdate.workMode) patch.workMode = res.filterUpdate.workMode
        if (res.filterUpdate.skills) patch.skills = res.filterUpdate.skills
        if (res.filterUpdate.search) patch.search = res.filterUpdate.search
        if (res.filterUpdate.location) patch.location = res.filterUpdate.location
        if (Object.keys(patch).length > 0) {
          setFilters(patch)
          setView('jobs')
        }
        if (res.filterUpdate.view === 'dashboard') {
          setView('dashboard')
        }
      }

      setMessages(m => [...m, { role: 'assistant', content: res.message, intent: res.intent }])
    } catch (e) {
      setMessages(m => [...m, {
        role: 'assistant',
        content: '⚠️ Connection error. Make sure the backend is running on port 4000.'
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        style={{ ...styles.fab, ...(open ? styles.fabOpen : {}) }}
        onClick={() => setOpen(o => !o)}
        title="AI Assistant"
      >
        {open ? '✕' : '✨'}
        {!open && <span style={styles.fabLabel}>AI Assistant</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={styles.panel} className="fade-in">
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIcon}>✨</div>
              <div>
                <div style={styles.headerTitle}>AI Job Assistant</div>
                <div style={styles.headerSub}>LangGraph powered</div>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div style={styles.messages} className="scroll-area">
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...styles.msg,
                ...(msg.role === 'user' ? styles.userMsg : styles.asstMsg)
              }}>
                {msg.role === 'assistant' && (
                  <div style={styles.asstAvatar}>✨</div>
                )}
                <div style={{
                  ...styles.bubble,
                  ...(msg.role === 'user' ? styles.userBubble : styles.asstBubble)
                }}>
                  {msg.content}
                  {msg.intent && (
                    <div style={styles.intentTag}>intent: {msg.intent}</div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.msg}>
                <div style={styles.asstAvatar}>✨</div>
                <div style={styles.typing}>
                  <span style={{ animationDelay: '0s' }} />
                  <span style={{ animationDelay: '0.15s' }} />
                  <span style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div style={styles.suggestions}>
              {SUGGESTIONS.slice(0, 3).map(s => (
                <button key={s} style={styles.suggestion} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={styles.inputRow}>
            <input
              ref={inputRef}
              style={styles.input}
              placeholder="Ask me anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              style={{ ...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
              onClick={() => send()}
              disabled={!input.trim() || loading}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  fab: {
    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    color: '#fff',
    border: 'none', borderRadius: '99px',
    padding: '0 1.25rem',
    height: '48px',
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '1rem', fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(59,130,246,0.4)',
    zIndex: 900,
    transition: 'all 0.2s',
    fontFamily: 'var(--font)'
  },
  fabOpen: {
    padding: '0 1rem',
    boxShadow: 'none',
    background: 'var(--surface2)'
  },
  fabLabel: { fontSize: '0.875rem' },
  panel: {
    position: 'fixed', bottom: '5rem', right: '1.5rem',
    width: '380px',
    maxHeight: '560px',
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 900,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border)',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.05))'
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerIcon: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem'
  },
  headerTitle: { fontWeight: '700', fontSize: '0.9rem' },
  headerSub: { fontSize: '0.68rem', color: 'var(--text3)' },
  closeBtn: {
    background: 'none', border: 'none',
    color: 'var(--text3)', cursor: 'pointer',
    fontSize: '0.875rem', padding: '4px'
  },
  messages: {
    flex: 1, overflowY: 'auto',
    padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem'
  },
  msg: { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  userMsg: { flexDirection: 'row-reverse' },
  asstMsg: { flexDirection: 'row' },
  asstAvatar: {
    width: '28px', height: '28px', flexShrink: 0,
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem'
  },
  bubble: {
    maxWidth: '80%', padding: '0.6rem 0.875rem',
    borderRadius: '14px',
    fontSize: '0.845rem', lineHeight: 1.6
  },
  userBubble: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    borderBottomRightRadius: '4px'
  },
  asstBubble: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderBottomLeftRadius: '4px'
  },
  intentTag: {
    marginTop: '4px',
    fontSize: '0.62rem',
    color: 'var(--text3)',
    fontFamily: 'var(--mono)'
  },
  typing: {
    display: 'flex', gap: '4px', alignItems: 'center',
    padding: '0.75rem 1rem',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    borderBottomLeftRadius: '4px'
  },
  suggestions: {
    padding: '0 1rem 0.75rem',
    display: 'flex', flexDirection: 'column', gap: '4px'
  },
  suggestion: {
    background: 'none',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.4rem 0.75rem',
    color: 'var(--text2)',
    fontSize: '0.775rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, color 0.15s'
  },
  inputRow: {
    padding: '0.75rem 1rem',
    borderTop: '1px solid var(--border)',
    display: 'flex', gap: '8px', alignItems: 'center'
  },
  input: {
    flex: 1,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '0.6rem 0.875rem',
    color: 'var(--text)',
    fontSize: '0.875rem'
  },
  sendBtn: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', border: 'none',
    borderRadius: '10px',
    fontSize: '1rem', fontWeight: '700',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.15s'
  }
}
