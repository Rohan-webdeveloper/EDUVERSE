import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  RiDashboardLine, RiSearchLine, RiPlayListLine, RiFileTextLine,
  RiQuestionLine, RiTeamLine, RiRoadMapLine, RiBriefcaseLine,
  RiUserLine, RiFireLine, RiTimeLine, RiBookmarkLine, RiTrophyLine,
  RiRobotLine, RiLightbulbLine, RiArrowRightLine, RiLogoutBoxLine,
  RiMoonLine, RiSunLine, RiMenuLine, RiCloseLine, RiBrainLine,
  RiStarLine, RiCheckLine, RiBarChartLine,
} from 'react-icons/ri'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import './DashboardPage.css'

// ── AI Tips ────────────────────────────────────────────────────────────────────
const AI_TIPS = [
  '🧠 Spaced repetition increases retention by up to 200%. Review your notes after 1 day, 1 week, and 1 month.',
  '⏱️ The Pomodoro technique — 25 min study + 5 min break — boosts focus dramatically.',
  '📝 Teaching a concept to someone else is the fastest way to identify your weak spots.',
  '🎯 Setting specific daily goals (not vague ones) triples your chance of completion.',
  '🌙 Sleep consolidates memory. Studying before sleep improves recall by 20-30%.',
  '🔗 Connect new concepts to things you already know — this is called elaborative interrogation.',
  '📊 Practice problems > re-reading notes. Active recall is the gold standard for exam prep.',
  '💧 Staying hydrated improves cognitive performance by up to 13%.',
  '🎵 Instrumental music (no lyrics) can enhance focus and reduce study fatigue.',
  '🏆 Celebrate small wins! Dopamine from achievements fuels continued motivation.',
]

// ── Greeting ───────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard',  icon: <RiDashboardLine />,  label: 'Dashboard'  },
  { to: '/search',     icon: <RiSearchLine />,     label: 'Search'     },
  { to: '/playlists',  icon: <RiPlayListLine />,   label: 'Playlists'  },
  { to: '/notes',      icon: <RiFileTextLine />,   label: 'Notes'      },
  { to: '/quiz',       icon: <RiQuestionLine />,   label: 'Quiz'       },
  { to: '/community',  icon: <RiTeamLine />,       label: 'Community'  },
  { to: '/roadmap',    icon: <RiRoadMapLine />,    label: 'Roadmap'    },
  { to: '/career',     icon: <RiBriefcaseLine />,  label: 'Career'     },
  { to: '/profile',    icon: <RiUserLine />,       label: 'Profile'    },
]

// ── Quick Actions ──────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Search Videos',    to: '/search',   color: '#2563eb' },
  { icon: '📝', label: 'Generate Notes',   to: '/notes',    color: '#7c3aed' },
  { icon: '🧪', label: 'Take a Quiz',      to: '/quiz',     color: '#059669' },
  { icon: '🗺️', label: 'Study Roadmap',    to: '/roadmap',  color: '#d97706' },
  { icon: '🤖', label: 'Ask AI Doubt',     to: '/community',color: '#db2777' },
  { icon: '👥', label: 'Community',        to: '/community',color: '#0891b2' },
]

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, color, delay }) => (
  <motion.div
    className="db-stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    whileHover={{ y: -4, scale: 1.02 }}
    style={{ '--stat-color': color }}
  >
    <div className="db-stat-icon">{icon}</div>
    <motion.div
      className="db-stat-value"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.2 }}
    >
      {value ?? '—'}
    </motion.div>
    <div className="db-stat-label">{label}</div>
  </motion.div>
)

// ── Custom Tooltip for chart ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="db-chart-tooltip">
        <p className="db-chart-tooltip-label">{label}</p>
        <p className="db-chart-tooltip-value">{payload[0].value}h studied</p>
      </div>
    )
  }
  return null
}

// ─── Main Component ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [analytics, setAnalytics]         = useState(null)
  const [loading, setLoading]             = useState(true)
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [darkMode, setDarkMode]           = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  )
  const [tip] = useState(() => AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)])

  // ── Fetch analytics ──────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await api.get('/analytics/dashboard')
      // Map API response to the format expected by the frontend
      setAnalytics({
        streak: data.stats?.streak || 0,
        watchTime: data.stats?.watchTime || 0,
        bookmarks: data.stats?.bookmarks || 0,
        quizzesTaken: data.stats?.quizzesTaken || 0,
        weeklyStudyHours: data.progress?.weeklyStudyHours || [],
        recentQuizzes: (data.quizResults || []).map(q => ({
          ...q,
          total: q.totalQuestions || 10,
          date: q.createdAt || new Date(),
        })),
        recentSearches: (data.recentSearches || []).map(s => s.query || s),
        dailyGoal: data.progress?.dailyGoal || null,
        recommendations: data.recommendations || [],
      })
    } catch {
      // Use fallback demo data so UI is never blank
      setAnalytics({
        streak: 7,
        watchTime: 142,
        bookmarks: 23,
        quizzesTaken: 11,
        weeklyStudyHours: [
          { day: 'Mon', hours: 2.5 },
          { day: 'Tue', hours: 1.8 },
          { day: 'Wed', hours: 3.2 },
          { day: 'Thu', hours: 0.5 },
          { day: 'Fri', hours: 4.1 },
          { day: 'Sat', hours: 2.0 },
          { day: 'Sun', hours: 1.3 },
        ],
        recentQuizzes: [
          { topic: 'Thermodynamics', score: 8, total: 10, date: '2026-06-01' },
          { topic: 'Organic Chemistry', score: 6, total: 10, date: '2026-05-30' },
          { topic: 'Calculus Integration', score: 9, total: 10, date: '2026-05-28' },
        ],
        recentSearches: ['Newton laws', 'Mole concept', 'Integration by parts', 'Electrostatics'],
        dailyGoal: { target: 120, achieved: 85 },
        recommendations: [
          { title: 'Laws of Motion - In Depth', channel: 'Physics Wallah', query: 'newton laws of motion' },
          { title: 'Mole Concept Masterclass',  channel: 'Vedantu',        query: 'mole concept' },
        ],
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  // ── Dark mode toggle ─────────────────────────────────────────────────────────
  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  }

  // ── Skeleton loader ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="db-layout">
        <aside className="db-sidebar db-sidebar--static">
          <div className="db-sidebar-logo">
            <span className="db-logo-icon">🎓</span>
            <span className="db-logo-text">EduVerse AI</span>
          </div>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="db-skeleton db-skeleton--nav" />
          ))}
        </aside>
        <main className="db-main">
          <div className="db-skeleton db-skeleton--heading" />
          <div className="db-stats-row">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="db-skeleton db-skeleton--card" />
            ))}
          </div>
          <div className="db-skeleton db-skeleton--chart" />
        </main>
      </div>
    )
  }

  const a = analytics
  const firstName = user?.name?.split(' ')[0] || 'Student'
  const goalPct = a?.dailyGoal
    ? Math.min(100, Math.round((a.dailyGoal.achieved / a.dailyGoal.target) * 100))
    : 0

  return (
    <div className={`db-layout ${darkMode ? 'db-dark' : ''}`}>
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="db-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`db-sidebar ${sidebarOpen ? 'db-sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="db-sidebar-logo">
          <span className="db-logo-icon">🎓</span>
          <span className="db-logo-text">EduVerse AI</span>
          <button
            className="db-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <RiCloseLine />
          </button>
        </div>

        {/* User profile mini */}
        <div className="db-sidebar-profile">
          <div className="db-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{firstName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="db-sidebar-user-info">
            <p className="db-sidebar-name">{user?.name || 'Student'}</p>
            <p className="db-sidebar-exam">{user?.exam || 'JEE / NEET'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="db-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `db-nav-link ${isActive ? 'db-nav-link--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="db-nav-icon">{item.icon}</span>
              <span className="db-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="db-sidebar-bottom">
          <button className="db-sidebar-action" onClick={toggleDark}>
            {darkMode ? <RiSunLine /> : <RiMoonLine />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="db-sidebar-action db-sidebar-action--logout" onClick={logout}>
            <RiLogoutBoxLine />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="db-main">
        {/* Top bar */}
        <header className="db-topbar">
          <button
            className="db-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <RiMenuLine />
          </button>
          <div className="db-topbar-right">
            <button className="db-icon-btn" onClick={toggleDark} title="Toggle theme">
              {darkMode ? <RiSunLine /> : <RiMoonLine />}
            </button>
            <div className="db-topbar-avatar" onClick={() => navigate('/profile')}>
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span>{firstName[0]?.toUpperCase()}</span>
              }
            </div>
          </div>
        </header>

        <div className="db-content">
          {/* ── Greeting ─────────────────────────────────────────────────────── */}
          <motion.div
            className="db-greeting"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="db-greeting-text">
              {getGreeting()}, {firstName}! 🌟
            </h1>
            <p className="db-greeting-sub">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              &nbsp;·&nbsp;Keep up the great work!
            </p>
          </motion.div>

          {/* ── Stats Cards ──────────────────────────────────────────────────── */}
          <div className="db-stats-row">
            <StatCard icon={<RiFireLine />}      value={a?.streak}       label="Day Streak"     color="#ef4444" delay={0.1} />
            <StatCard icon={<RiTimeLine />}      value={a?.watchTime}    label="Mins Watched"   color="#2563eb" delay={0.15} />
            <StatCard icon={<RiBookmarkLine />}  value={a?.bookmarks}    label="Bookmarks"      color="#7c3aed" delay={0.2} />
            <StatCard icon={<RiTrophyLine />}    value={a?.quizzesTaken} label="Quizzes Taken"  color="#d97706" delay={0.25} />
          </div>

          {/* ── Weekly Chart + Daily Goal ─────────────────────────────────────── */}
          <div className="db-row-2col">
            {/* Bar Chart */}
            <motion.div
              className="db-card db-chart-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="db-card-header">
                <RiBarChartLine className="db-card-header-icon" />
                <h2 className="db-card-title">Weekly Study Hours</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={a?.weeklyStudyHours || []} barSize={28} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--db-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--db-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--db-text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                  <Bar dataKey="hours" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Daily Goal */}
            <motion.div
              className="db-card db-goal-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="db-card-header">
                <RiStarLine className="db-card-header-icon" />
                <h2 className="db-card-title">Daily Goal</h2>
              </div>
              <div className="db-goal-body">
                <div className="db-goal-circle-wrap">
                  <svg className="db-goal-circle" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" className="db-goal-circle-bg" />
                    <motion.circle
                      cx="60" cy="60" r="50"
                      className="db-goal-circle-fill"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - goalPct / 100) }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="db-goal-pct">{goalPct}%</div>
                </div>
                <div className="db-goal-stats">
                  <div className="db-goal-stat">
                    <span className="db-goal-stat-val">{a?.dailyGoal?.achieved ?? 0}</span>
                    <span className="db-goal-stat-lbl">min achieved</span>
                  </div>
                  <div className="db-goal-divider" />
                  <div className="db-goal-stat">
                    <span className="db-goal-stat-val">{a?.dailyGoal?.target ?? 120}</span>
                    <span className="db-goal-stat-lbl">min target</span>
                  </div>
                </div>
                <div className="db-goal-bar-wrap">
                  <div className="db-goal-bar-track">
                    <motion.div
                      className="db-goal-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${goalPct}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="db-goal-bar-label">{goalPct}% of daily goal</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Quiz Results + Quick Actions ──────────────────────────────────── */}
          <div className="db-row-2col">
            {/* Recent Quiz Results */}
            <motion.div
              className="db-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="db-card-header">
                <RiTrophyLine className="db-card-header-icon" />
                <h2 className="db-card-title">Recent Quiz Results</h2>
                <button className="db-card-action" onClick={() => navigate('/quiz')}>
                  View All <RiArrowRightLine />
                </button>
              </div>
              <div className="db-quiz-list">
                {a?.recentQuizzes?.length ? a.recentQuizzes.map((q, i) => {
                  const pct = Math.round((q.score / q.total) * 100)
                  return (
                    <motion.div
                      key={i}
                      className="db-quiz-item"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.05 }}
                    >
                      <div className="db-quiz-item-top">
                        <span className="db-quiz-topic">{q.topic}</span>
                        <span className={`db-quiz-score ${pct >= 70 ? 'db-quiz-score--good' : 'db-quiz-score--low'}`}>
                          {q.score}/{q.total}
                        </span>
                      </div>
                      <div className="db-quiz-bar-track">
                        <motion.div
                          className={`db-quiz-bar-fill ${pct >= 70 ? '' : 'db-quiz-bar-fill--low'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        />
                      </div>
                      <div className="db-quiz-meta">
                        <span className="db-quiz-date">{new Date(q.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span className="db-quiz-pct">{pct}%</span>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <div className="db-empty-state">
                    <RiQuestionLine className="db-empty-icon" />
                    <p>No quizzes yet. <button onClick={() => navigate('/quiz')}>Take your first quiz!</button></p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="db-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="db-card-header">
                <RiLightbulbLine className="db-card-header-icon" />
                <h2 className="db-card-title">Quick Actions</h2>
              </div>
              <div className="db-actions-grid">
                {QUICK_ACTIONS.map((action, i) => (
                  <motion.button
                    key={i}
                    className="db-action-btn"
                    style={{ '--action-color': action.color }}
                    onClick={() => navigate(action.to)}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.04 }}
                  >
                    <span className="db-action-icon">{action.icon}</span>
                    <span className="db-action-label">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Recent Searches ───────────────────────────────────────────────── */}
          {a?.recentSearches?.length > 0 && (
            <motion.div
              className="db-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="db-card-header">
                <RiSearchLine className="db-card-header-icon" />
                <h2 className="db-card-title">Recent Searches</h2>
              </div>
              <div className="db-chips-row">
                {a.recentSearches.map((s, i) => (
                  <motion.button
                    key={i}
                    className="db-chip"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                  >
                    <RiSearchLine /> {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Recommendations ───────────────────────────────────────────────── */}
          {a?.recommendations?.length > 0 && (
            <motion.div
              className="db-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <div className="db-card-header">
                <RiBrainLine className="db-card-header-icon" />
                <h2 className="db-card-title">Continue Learning</h2>
              </div>
              <div className="db-reco-list">
                {a.recommendations.map((r, i) => (
                  <motion.div
                    key={i}
                    className="db-reco-item"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(r.query)}`)}
                    whileHover={{ x: 4 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                  >
                    <div className="db-reco-thumb">▶</div>
                    <div className="db-reco-info">
                      <p className="db-reco-title">{r.title}</p>
                      <p className="db-reco-channel">{r.channel}</p>
                    </div>
                    <RiArrowRightLine className="db-reco-arrow" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── AI Tip of the Day ─────────────────────────────────────────────── */}
          <motion.div
            className="db-tip-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <div className="db-tip-icon"><RiRobotLine /></div>
            <div className="db-tip-content">
              <p className="db-tip-label">AI Tip of the Day</p>
              <p className="db-tip-text">{tip}</p>
            </div>
            <div className="db-tip-badge">
              <RiCheckLine /> Powered by AI
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
