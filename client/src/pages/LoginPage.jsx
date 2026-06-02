import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdError,
  MdCheckCircle,
  MdArrowForward,
  MdStar,
} from 'react-icons/md'
import {
  HiAcademicCap,
  HiLightningBolt,
  HiChartBar,
  HiSparkles,
} from 'react-icons/hi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

/* ─── Floating Feature Card data ───────────────────────────────── */
const FEATURE_CARDS = [
  {
    icon: '🤖',
    title: 'AI-Powered Learning',
    desc: 'Personalised study plans & smart quizzes',
  },
  {
    icon: '📊',
    title: 'Performance Analytics',
    desc: 'Track progress across all your subjects',
  },
  {
    icon: '🏆',
    title: 'Exam-Ready Content',
    desc: 'JEE, NEET, UPSC, GATE & 6 more exams',
  },
]

/* ─── Animation Variants ────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

/* ─── Validation helpers ─────────────────────────────────────────── */
const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
  return ''
}

const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return ''
}

/* ═══════════════════════════════════════════════════════════════════
   LoginPage Component
   ═══════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, googleLogin, isAuthenticated, loading: authLoading } = useAuth()

  /* ── State ─────────────────────────────────────────────────────── */
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  /* ── Redirect if already authenticated ─────────────────────────── */
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  /* ── Validate on change ─────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setGlobalError('')

    if (touched[name]) {
      const validator = name === 'email' ? validateEmail : validatePassword
      setErrors((prev) => ({ ...prev, [name]: validator(value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const validator = name === 'email' ? validateEmail : validatePassword
    setErrors((prev) => ({ ...prev, [name]: validator(value) }))
  }

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError('')

    // Touch all fields & validate
    const emailErr = validateEmail(form.email)
    const passwordErr = validatePassword(form.password)
    setErrors({ email: emailErr, password: passwordErr })
    setTouched({ email: true, password: true })

    if (emailErr || passwordErr) return

    setIsLoading(true)
    try {
      const result = await login(form.email, form.password)
      if (result.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setGlobalError(result.error || 'Login failed. Please check your credentials.')
      }
    } catch {
      setGlobalError('An unexpected error occurred. Please try again.')
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Google Login ───────────────────────────────────────────────── */
  const handleGoogleLogin = () => {
    googleLogin()
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  if (authLoading) {
    return (
      <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="btn-spinner" style={{ width: 36, height: 36, borderWidth: 3, borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563eb' }} />
      </div>
    )
  }

  return (
    <div className="auth-page">
      {/* ════════════════ LEFT PANEL ════════════════ */}
      <div className="auth-left">
        <div className="auth-left-content">
          {/* Brand */}
          <motion.div
            className="auth-brand"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="auth-brand-icon">🎓</div>
            <div className="auth-brand-text">
              <h2>EduVerse AI</h2>
              <span>Intelligent Learning Platform</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            className="auth-headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1>
              Learn Smarter,<br />
              Achieve More 🚀
            </h1>
            <p>
              Join over <strong style={{ color: '#fff' }}>2 lakh+ students</strong> who are
              acing their competitive exams with AI-powered personalised study plans.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="auth-float-cards">
            {FEATURE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="auth-float-card"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.3 + i * 0.1 }}
              >
                <div className="auth-float-card-icon">{card.icon}</div>
                <div className="auth-float-card-text">
                  <strong>{card.title}</strong>
                  <span>{card.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <motion.div
            className="auth-testimonial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <div className="auth-testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <MdStar key={i} style={{ color: '#fbbf24', fontSize: 15 }} />
              ))}
            </div>
            <blockquote>
              "EduVerse AI's personalised approach helped me crack JEE Advanced in my first
              attempt. The AI mock tests are incredibly realistic!"
            </blockquote>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">AR</div>
              <div className="auth-testimonial-info">
                <strong>Arjun Raj</strong>
                <span>JEE Advanced AIR 342 · IIT Bombay</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ════════════════ RIGHT PANEL ════════════════ */}
      <div className="auth-right">
        <motion.div
          className="auth-form-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Brand (hidden on desktop) */}
          <motion.div className="auth-mobile-brand" variants={itemVariants}>
            <div className="auth-mobile-brand-icon">🎓</div>
            <span>EduVerse AI</span>
          </motion.div>

          {/* Header */}
          <motion.div className="auth-form-header" variants={itemVariants}>
            <span className="auth-welcome-emoji">👋</span>
            <h2>Welcome back!</h2>
            <p>Sign in to continue your learning journey</p>
          </motion.div>

          {/* Global Error */}
          <AnimatePresence>
            {globalError && (
              <motion.div
                className="auth-error-banner"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <MdError />
                <span>{globalError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
            variants={itemVariants}
          >
            {/* Email Field */}
            <div className="form-field">
              <label className="form-label" htmlFor="login-email">
                Email address <span className="label-required">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <MdEmail />
                </span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className={`form-input${errors.email && touched.email ? ' input-error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {errors.email && touched.email && (
                  <motion.div
                    className="field-error"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MdError />
                    <span>{errors.email}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label className="form-label" htmlFor="login-password">
                Password <span className="label-required">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <MdLock />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input has-action${errors.password && touched.password ? ' input-error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && touched.password && (
                  <motion.div
                    className="field-error"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MdError />
                    <span>{errors.password}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Forgot Password */}
            <div className="auth-forgot-row">
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="btn-spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <MdArrowForward style={{ fontSize: 18 }} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or continue with</span>
              <div className="auth-divider-line" />
            </div>

            {/* Google Button */}
            <motion.button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
            >
              <span className="google-icon-wrapper">
                <FcGoogle style={{ fontSize: 20 }} />
              </span>
              <span>Continue with Google</span>
            </motion.button>
          </motion.form>

          {/* Switch to Register */}
          <motion.div className="auth-switch" variants={itemVariants}>
            Don't have an account?{' '}
            <Link to="/register">Create one free →</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
