import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// ─── Full-Screen Loader ────────────────────────────────────────────────────────
const AuthLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary, #fff)',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }}
      />
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#64748b',
          margin: 0,
        }}
      >
        Loading EduVerse AI...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
)

// ─── Protected Route ───────────────────────────────────────────────────────────
/**
 * Wraps a component/element and redirects to /login if the user is not
 * authenticated. Preserves the attempted URL so the user can be sent back
 * after login.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// ─── Admin Route ───────────────────────────────────────────────────────────────
/**
 * Wraps a component/element and redirects to /dashboard if the user is
 * authenticated but NOT an admin. Redirects to /login if not authenticated
 * at all.
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
