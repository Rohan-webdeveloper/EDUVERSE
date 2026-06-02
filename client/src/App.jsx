import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute, AdminRoute } from '@/components/common/ProtectedRoute'

// ─── Lazy Page Imports ─────────────────────────────────────────────────────────
const LandingPage        = lazy(() => import('@/pages/LandingPage'))
const LoginPage          = lazy(() => import('@/pages/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage      = lazy(() => import('@/pages/DashboardPage'))
const SearchPage         = lazy(() => import('@/pages/SearchPage'))
const VideoPlayerPage    = lazy(() => import('@/pages/VideoPlayerPage'))
const PlaylistsPage      = lazy(() => import('@/pages/PlaylistsPage'))
const NotesPage          = lazy(() => import('@/pages/NotesPage'))
const QuizPage           = lazy(() => import('@/pages/QuizPage'))
const CommunityPage      = lazy(() => import('@/pages/CommunityPage'))
const RoadmapPage        = lazy(() => import('@/pages/RoadmapPage'))
const CareerPage         = lazy(() => import('@/pages/CareerPage'))
const ProfilePage        = lazy(() => import('@/pages/ProfilePage'))
const AdminDashboard     = lazy(() => import('@/pages/AdminDashboard'))
const AuthCallback       = lazy(() => import('@/pages/AuthCallback'))
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage'))

// Eagerly loaded - always visible
import AIAssistant from '@/components/ai/AIAssistant'

// ─── Full-Screen Suspense Fallback ─────────────────────────────────────────────
const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary, #f8fafc)',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    {/* Animated logo mark */}
    <div
      style={{
        position: 'relative',
        width: '56px',
        height: '56px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
        }}
      >
        🎓
      </div>
    </div>

    {/* Spinner */}
    <div
      style={{
        width: '32px',
        height: '32px',
        border: '2.5px solid #e2e8f0',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'eduverse-spin 0.7s linear infinite',
      }}
    />

    <p
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        fontWeight: '500',
        color: '#94a3b8',
        margin: 0,
        letterSpacing: '0.02em',
      }}
    >
      EduVerse AI
    </p>

    <style>{`
      @keyframes eduverse-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

// ─── App ───────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public Routes ──────────────────────────────────────── */}
            <Route path="/"               element={<LandingPage />} />
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/register"       element={<RegisterPage />} />
            <Route path="/search"         element={<SearchPage />} />
            <Route path="/video/:id"      element={<VideoPlayerPage />} />
            <Route path="/community"      element={<CommunityPage />} />
            <Route path="/auth/callback"  element={<AuthCallback />} />

            {/* ── Protected Routes ───────────────────────────────────── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists"
              element={
                <ProtectedRoute>
                  <PlaylistsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <NotesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <RoadmapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career"
              element={
                <ProtectedRoute>
                  <CareerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* ── Admin Routes ───────────────────────────────────────── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* ── 404 ───────────────────────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <AIAssistant />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
