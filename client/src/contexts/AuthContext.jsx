import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '@/services/api'

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Axios instance for auth (avoids circular dep with main api.js) ────────────
const authAxios = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('eduverse_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [accessToken, setAccessToken] = useState(() =>
    getAccessToken()
  )
  const [refreshToken, setRefreshTokenState] = useState(() =>
    getRefreshToken()
  )
  const [loading, setLoading] = useState(true)
  const refreshTimerRef = useRef(null)

  // Derived
  const isAuthenticated = Boolean(user && accessToken)
  const isAdmin = user?.role === 'admin'

  // ── Persist user to localStorage ──────────────────────────────────────────
  const persistUser = (userData) => {
    if (userData) {
      localStorage.setItem('eduverse_user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('eduverse_user')
    }
  }

  // ── Apply tokens globally ──────────────────────────────────────────────────
  const applyTokens = useCallback((access, refresh) => {
    setTokens(access, refresh)
    setAccessToken(access)
    if (refresh) setRefreshTokenState(refresh)
    if (access) {
      authAxios.defaults.headers.common.Authorization = `Bearer ${access}`
    } else {
      delete authAxios.defaults.headers.common.Authorization
    }
  }, [])

  // ── Clear everything ───────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    clearTokens()
    setUser(null)
    setAccessToken(null)
    setRefreshTokenState(null)
    persistUser(null)
    delete authAxios.defaults.headers.common.Authorization
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }
  }, [])

  // ── Verify session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const verifySession = async () => {
      const token = getAccessToken()
      const refresh = getRefreshToken()

      if (!token && !refresh) {
        setLoading(false)
        return
      }

      try {
        authAxios.defaults.headers.common.Authorization = `Bearer ${token}`
        const { data } = await authAxios.get('/auth/me')
        setUser(data.user)
        persistUser(data.user)
        if (token) setAccessToken(token)
        if (refresh) setRefreshTokenState(refresh)
      } catch (err) {
        // Try refreshing
        if (refresh) {
          try {
            const { data } = await authAxios.post('/auth/refresh', {
              refreshToken: refresh,
            })
            applyTokens(data.accessToken, data.refreshToken)
            setUser(data.user)
            persistUser(data.user)
          } catch {
            clearAll()
          }
        } else {
          clearAll()
        }
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await authAxios.post('/auth/login', {
          email,
          password,
        })

        const { user: userData, accessToken: access, refreshToken: refresh } = data

        applyTokens(access, refresh)
        setUser(userData)
        persistUser(userData)

        toast.success(`Welcome back, ${userData.name?.split(' ')[0] || 'there'}! 👋`)
        return { success: true, user: userData }
      } catch (err) {
        const message =
          err.response?.data?.message || 'Login failed. Please try again.'
        toast.error(message)
        return { success: false, error: message }
      }
    },
    [applyTokens]
  )

  // ── REGISTER ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (name, email, password, exam = null, subjects = []) => {
      try {
        const { data } = await authAxios.post('/auth/register', {
          name,
          email,
          password,
          exam,
          subjects,
        })

        const { user: userData, accessToken: access, refreshToken: refresh } = data

        applyTokens(access, refresh)
        setUser(userData)
        persistUser(userData)

        toast.success(`Welcome to EduVerse AI, ${userData.name?.split(' ')[0]}! 🎉`)
        return { success: true, user: userData }
      } catch (err) {
        const message =
          err.response?.data?.message || 'Registration failed. Please try again.'
        toast.error(message)
        return { success: false, error: message }
      }
    },
    [applyTokens]
  )

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refresh = getRefreshToken()
      await authAxios.post('/auth/logout', { refreshToken: refresh })
    } catch {
      // Fail silently — clear locally regardless
    } finally {
      clearAll()
      toast.success('Logged out successfully. See you soon! 👋')
    }
  }, [clearAll])

  // ── UPDATE USER ────────────────────────────────────────────────────────────
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData }
      persistUser(merged)
      return merged
    })
  }, [])

  // ── GOOGLE LOGIN ───────────────────────────────────────────────────────────
  const googleLogin = useCallback(() => {
    window.location.href = '/api/auth/google'
  }, [])

  // ── SET TOKENS FROM OAUTH CALLBACK ────────────────────────────────────────
  const setAuthFromCallback = useCallback(
    async (access, refresh) => {
      try {
        applyTokens(access, refresh)
        const { data } = await authAxios.get('/auth/me')
        setUser(data.user)
        persistUser(data.user)
        toast.success(`Welcome, ${data.user.name?.split(' ')[0]}! 🎉`)
        return { success: true, user: data.user }
      } catch {
        clearAll()
        return { success: false }
      }
    },
    [applyTokens, clearAll]
  )

  // ── REFRESH TOKEN ──────────────────────────────────────────────────────────
  const refreshAccessToken = useCallback(async () => {
    const refresh = getRefreshToken()
    if (!refresh) return false

    try {
      const { data } = await authAxios.post('/auth/refresh', {
        refreshToken: refresh,
      })
      applyTokens(data.accessToken, data.refreshToken)
      if (data.user) {
        setUser(data.user)
        persistUser(data.user)
      }
      return true
    } catch {
      clearAll()
      return false
    }
  }, [applyTokens, clearAll])

  const value = {
    // State
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated,
    isAdmin,

    // Actions
    login,
    register,
    logout,
    updateUser,
    googleLogin,
    setAuthFromCallback,
    refreshAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
