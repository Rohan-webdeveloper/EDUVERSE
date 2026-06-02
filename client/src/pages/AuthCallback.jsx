import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

/**
 * AuthCallback
 *
 * Handles the redirect from Google OAuth (or any OAuth provider).
 * The backend redirects to /auth/callback?token=ACCESS&refresh=REFRESH
 * after a successful OAuth handshake.
 *
 * Steps:
 * 1. Read `token` and `refresh` from URL search params.
 * 2. Call `setAuthFromCallback` to store tokens and fetch the user profile.
 * 3. Redirect to /dashboard on success, /login on failure.
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuthFromCallback } = useAuth()
  const [status, setStatus] = useState('processing') // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('Completing sign-in…')
  const hasFired = useRef(false)

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasFired.current) return
    hasFired.current = true

    const handleCallback = async () => {
      const token = searchParams.get('token')
      const refresh = searchParams.get('refresh')
      const error = searchParams.get('error')

      // OAuth error returned by the backend
      if (error) {
        const decoded = decodeURIComponent(error)
        setStatus('error')
        setMessage(decoded || 'Authentication failed.')
        toast.error(decoded || 'Google sign-in was cancelled or failed.')
        setTimeout(() => navigate('/login', { replace: true }), 2500)
        return
      }

      // Missing tokens
      if (!token) {
        setStatus('error')
        setMessage('No authentication token received.')
        toast.error('Authentication failed — no token received.')
        setTimeout(() => navigate('/login', { replace: true }), 2500)
        return
      }

      // Store tokens and fetch user
      const result = await setAuthFromCallback(token, refresh)

      if (result.success) {
        setStatus('success')
        setMessage(`Welcome, ${result.user?.name?.split(' ')[0] || 'there'}! Redirecting…`)
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
      } else {
        setStatus('error')
        setMessage('Could not retrieve your profile. Please try again.')
        toast.error('Authentication failed — please try again.')
        setTimeout(() => navigate('/login', { replace: true }), 2500)
      }
    }

    handleCallback()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Styles ─────────────────────────────────────────────────────────────────
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--bg-primary, #f8fafc)',
    fontFamily: 'Inter, sans-serif',
    padding: '24px',
  }

  const cardStyle = {
    background: 'var(--bg-secondary, #fff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '20px',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  }

  const logoStyle = {
    fontSize: '36px',
    marginBottom: '24px',
  }

  const spinnerStyle = {
    width: '48px',
    height: '48px',
    border: '3px solid #e2e8f0',
    borderTopColor: status === 'error' ? '#ef4444' : '#2563eb',
    borderRadius: '50%',
    animation: status === 'processing' ? 'spin 0.8s linear infinite' : 'none',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  }

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary, #0f172a)',
    marginBottom: '8px',
  }

  const subtitleStyle = {
    fontSize: '14px',
    color: 'var(--text-secondary, #64748b)',
    lineHeight: '1.5',
    margin: 0,
  }

  const statusIcon = {
    processing: null,
    success: '✅',
    error: '❌',
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>🎓</div>

        <div style={spinnerStyle}>
          {status !== 'processing' && (
            <span style={{ border: 'none', fontSize: '24px' }}>
              {statusIcon[status]}
            </span>
          )}
        </div>

        <h1 style={titleStyle}>
          {status === 'processing' && 'Signing you in…'}
          {status === 'success' && 'Signed in!'}
          {status === 'error' && 'Sign-in failed'}
        </h1>

        <p style={subtitleStyle}>{message}</p>

        {status === 'error' && (
          <a
            href="/login"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 24px',
              background: '#2563eb',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Back to Login
          </a>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AuthCallback
