import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'
import { useStore } from '../store/index.js'
import Sidebar from '../components/Sidebar.jsx'
import JobList from '../components/JobList.jsx'
import Filters from '../components/Filters.jsx'
import BestMatches from '../components/BestMatches.jsx'
import ApplicationDashboard from '../components/ApplicationDashboard.jsx'
import ApplyPopup from '../components/ApplyPopup.jsx'
import Assistant from '../components/Assistant.jsx'

export default function Dashboard() {
  const navigate = useNavigate()
  const { setAuth, clearAuth, setJobs, setResume, setApplications, setAllScores,
    filters, view, setMatchingAll, scores, resume } = useStore()
  const [loading, setLoading] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(false)

  // Boot: verify session, load resume & applications
  useEffect(() => {
    async function boot() {
      try {
        const { user } = await api.me()
        setAuth(user, localStorage.getItem('jt_token'))
        const [resumeData, appsData] = await Promise.allSettled([
          api.getResume(),
          api.getApplications()
        ])
        if (resumeData.status === 'fulfilled') setResume(resumeData.value)
        if (appsData.status === 'fulfilled') setApplications(appsData.value.applications)
      } catch {
        clearAuth()
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [])

  // Fetch jobs whenever filters change
  useEffect(() => {
    if (loading) return
    fetchJobs()
  }, [filters, loading])

  // Auto match-all when resume is available
  useEffect(() => {
    if (resume && Object.keys(scores).length === 0) {
      runMatchAll()
    }
  }, [resume])

  async function fetchJobs() {
    setJobsLoading(true)
    try {
      const { jobs } = await api.getJobs(filters)
      setJobs(jobs)
    } catch (e) {
      console.error(e)
    } finally {
      setJobsLoading(false)
    }
  }

  async function runMatchAll() {
    if (!resume) return
    setMatchingAll(true)
    try {
      const results = await api.matchAll()
      setAllScores(results)
    } catch (e) {
      console.error('Match all failed:', e)
    } finally {
      setMatchingAll(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <Sidebar onMatchAll={runMatchAll} />

      {/* Main content */}
      <div style={styles.main}>
        {view === 'jobs' ? (
          <>
            {/* Filters bar */}
            <Filters />

            {/* Best matches section */}
            <BestMatches />

            {/* All jobs */}
            <JobList loading={jobsLoading} />
          </>
        ) : (
          <ApplicationDashboard />
        )}
      </div>

      {/* Apply popup */}
      <ApplyPopup />

      {/* Floating AI assistant */}
      <Assistant />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', flexDirection: 'column', gap: '1rem'
    }}>
      <div style={{
        width: '44px', height: '44px',
        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', animation: 'glow 2s ease-in-out infinite'
      }}>⚡</div>
      <div style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>Loading JobTrack AI…</div>
    </div>
  )
}

const styles = {
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg)'
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  }
}
