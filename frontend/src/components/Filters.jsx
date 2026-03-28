import React, { useState } from 'react'
import { useStore } from '../store/index.js'

const SKILLS_OPTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Next.js',
  'GraphQL', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL',
  'Redis', 'Vue', 'Go', 'Swift', 'Machine Learning'
]

export default function Filters() {
  const { filters, setFilter, setFilters, resetFilters } = useStore()
  const [skillsOpen, setSkillsOpen] = useState(false)

  const selectedSkills = filters.skills ? filters.skills.split(',').filter(Boolean) : []

  function toggleSkill(skill) {
    const current = new Set(selectedSkills)
    if (current.has(skill)) current.delete(skill)
    else current.add(skill)
    setFilter('skills', [...current].join(','))
  }

  const hasActiveFilters = filters.search || filters.type !== 'all' ||
    filters.workMode !== 'all' || filters.location || filters.skills || filters.days

  return (
    <div style={styles.bar}>
      {/* Search */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.search}
          placeholder="Search title, company, skills…"
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        {filters.search && (
          <button style={styles.clearX} onClick={() => setFilter('search', '')}>✕</button>
        )}
      </div>

      <div style={styles.row}>
        {/* Job Type */}
        <Select
          label="Type"
          value={filters.type}
          onChange={v => setFilter('type', v)}
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'Full-time', value: 'full-time' },
            { label: 'Part-time', value: 'part-time' },
            { label: 'Contract', value: 'contract' },
            { label: 'Internship', value: 'internship' },
          ]}
        />

        {/* Work Mode */}
        <Select
          label="Mode"
          value={filters.workMode}
          onChange={v => setFilter('workMode', v)}
          options={[
            { label: 'All Modes', value: 'all' },
            { label: '🌐 Remote', value: 'remote' },
            { label: '🏢 On-site', value: 'onsite' },
            { label: '🔄 Hybrid', value: 'hybrid' },
          ]}
        />

        {/* Location */}
        <div style={styles.inputWrap}>
          <input
            style={styles.filterInput}
            placeholder="📍 Location"
            value={filters.location}
            onChange={e => setFilter('location', e.target.value)}
          />
        </div>

        {/* Date Posted */}
        <Select
          label="Posted"
          value={filters.days}
          onChange={v => setFilter('days', v)}
          options={[
            { label: 'Any time', value: '' },
            { label: 'Past 24h', value: '1' },
            { label: 'Past 3 days', value: '3' },
            { label: 'Past week', value: '7' },
            { label: 'Past month', value: '30' },
          ]}
        />

        {/* Skills multi-select */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              ...styles.skillsBtn,
              ...(selectedSkills.length > 0 ? styles.skillsBtnActive : {})
            }}
            onClick={() => setSkillsOpen(o => !o)}
          >
            🛠 Skills {selectedSkills.length > 0 && <span style={styles.skillsBadge}>{selectedSkills.length}</span>}
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>{skillsOpen ? '▲' : '▼'}</span>
          </button>
          {skillsOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownGrid}>
                {SKILLS_OPTIONS.map(skill => (
                  <label key={skill} style={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      style={{ accentColor: '#3b82f6' }}
                    />
                    <span style={styles.checkLabel}>{skill}</span>
                  </label>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <button
                  style={styles.clearSkills}
                  onClick={() => { setFilter('skills', ''); setSkillsOpen(false) }}
                >
                  Clear skills
                </button>
              )}
            </div>
          )}
        </div>

        {/* Match score filter */}
        <div style={styles.scoreFilter}>
          <span style={styles.scoreLabel}>Min score</span>
          <input
            type="range" min="0" max="90" step="10"
            value={filters.minScore}
            onChange={e => setFilter('minScore', Number(e.target.value))}
            style={styles.range}
          />
          <span style={styles.scoreVal}>{filters.minScore}%</span>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button style={styles.resetBtn} onClick={resetFilters}>
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={styles.select}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

const styles = {
  bar: {
    padding: '1rem 1.5rem',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    position: 'sticky', top: 0, zIndex: 10
  },
  searchWrap: {
    position: 'relative',
    display: 'flex', alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute', left: '12px',
    fontSize: '0.9rem', pointerEvents: 'none'
  },
  search: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.6rem 2rem 0.6rem 2.25rem',
    color: 'var(--text)',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s'
  },
  clearX: {
    position: 'absolute', right: '10px',
    background: 'none', color: 'var(--text3)',
    fontSize: '0.75rem', cursor: 'pointer', padding: '4px'
  },
  row: {
    display: 'flex', alignItems: 'center',
    gap: '0.5rem', flexWrap: 'wrap'
  },
  select: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.5rem 0.75rem',
    color: 'var(--text)',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  inputWrap: { display: 'flex' },
  filterInput: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.5rem 0.75rem',
    color: 'var(--text)',
    fontSize: '0.8rem',
    width: '130px'
  },
  skillsBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.5rem 0.75rem',
    color: 'var(--text2)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    minWidth: '110px'
  },
  skillsBtnActive: {
    borderColor: '#3b82f6',
    color: '#3b82f6',
    background: 'var(--accent-glow)'
  },
  skillsBadge: {
    background: '#3b82f6', color: '#fff',
    fontSize: '0.65rem', fontWeight: '700',
    padding: '1px 6px', borderRadius: '99px'
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius)',
    padding: '1rem',
    zIndex: 50,
    boxShadow: 'var(--shadow-lg)',
    width: '280px'
  },
  dropdownGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '0.4rem'
  },
  checkRow: {
    display: 'flex', alignItems: 'center', gap: '6px',
    cursor: 'pointer', padding: '0.2rem 0'
  },
  checkLabel: { fontSize: '0.8rem', color: 'var(--text2)' },
  clearSkills: {
    marginTop: '0.75rem',
    background: 'none',
    border: 'none',
    color: 'var(--red)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '0'
  },
  scoreFilter: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginLeft: 'auto'
  },
  scoreLabel: { fontSize: '0.75rem', color: 'var(--text3)', whiteSpace: 'nowrap' },
  range: { width: '80px', accentColor: '#3b82f6', cursor: 'pointer' },
  scoreVal: {
    fontSize: '0.75rem', fontWeight: '600',
    color: '#3b82f6', minWidth: '30px'
  },
  resetBtn: {
    background: 'none',
    border: '1px solid var(--border2)',
    color: 'var(--text3)',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
  }
}
