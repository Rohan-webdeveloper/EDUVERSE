import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { MdSchool } from 'react-icons/md';
import './RegisterPage.css';

const EXAMS = ['JEE', 'NEET', 'UPSC', 'SSC', 'GATE', 'CAT', 'CUET', 'Class 10', 'Class 12'];
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Computer Science'];

export default function RegisterPage() {
  const { register, googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', exam: '', subjects: [] });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { level: 2, label: 'Medium', color: '#f59e0b' };
    return { level: 3, label: 'Strong', color: '#10b981' };
  };

  const strength = passwordStrength();

  const toggleSubject = (sub) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(sub) ? prev.subjects.filter(s => s !== sub) : [...prev.subjects, sub],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return toast.error('Fill in all required fields');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!agreed) return toast.error('Please agree to the terms');

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.exam, formData.subjects);
      toast.success('Welcome to EduVerse AI! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left Panel */}
      <div className="register-page__left">
        <div className="register-page__left-content">
          <Link to="/" className="register-page__logo">
            <div className="register-page__logo-icon"><MdSchool size={22} /></div>
            <span>EduVerse AI</span>
          </Link>
          <h1 className="register-page__left-title">Start your learning journey today</h1>
          <p className="register-page__left-subtitle">
            Join 500K+ students learning from PW, Khan Academy, Unacademy & more — all in one place.
          </p>
          <div className="register-page__features">
            {['AI-powered study tools', 'Personalized roadmaps', 'All educators in one place', 'Track your progress'].map(f => (
              <div className="register-page__feature" key={f}><FiCheck className="register-page__feature-icon" /><span>{f}</span></div>
            ))}
          </div>
          <div className="register-page__left-shapes">
            <div className="register-page__shape register-page__shape--1" />
            <div className="register-page__shape register-page__shape--2" />
            <div className="register-page__shape register-page__shape--3" />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="register-page__right">
        <div className="register-page__form-wrapper">
          <div className="register-page__header">
            <h2 className="register-page__title">Create your account</h2>
            <p className="register-page__subtitle">Free forever. No credit card required.</p>
          </div>

          <button className="register-page__google-btn" onClick={googleLogin} type="button">
            <FcGoogle size={20} />
            <span>Continue with Google</span>
          </button>

          <div className="divider-text">or register with email</div>

          <form className="register-page__form" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-icon">
                <FiUser className="icon" />
                <input type="text" className="form-input" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-input-icon">
                <FiMail className="icon" />
                <input type="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon">
                <FiLock className="icon" />
                <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{ paddingRight: '2.75rem' }} />
                <button type="button" className="register-page__toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {formData.password && (
                <div className="register-page__strength">
                  <div className="register-page__strength-bar">
                    <div className="register-page__strength-fill" style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }} />
                  </div>
                  <span style={{ color: strength.color, fontSize: '0.75rem', fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="form-input-icon">
                <FiLock className="icon" />
                <input type="password" className="form-input" placeholder="Re-enter password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="form-error">Passwords do not match</p>
              )}
            </div>

            {/* Exam */}
            <div className="form-group">
              <label className="form-label">Preparing for (optional)</label>
              <select className="form-input" value={formData.exam} onChange={e => setFormData({...formData, exam: e.target.value})}>
                <option value="">Select exam</option>
                {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>

            {/* Subjects */}
            <div className="form-group">
              <label className="form-label">Interested subjects (optional)</label>
              <div className="register-page__chips">
                {SUBJECTS.map(sub => (
                  <button type="button" key={sub} className={`register-page__chip ${formData.subjects.includes(sub) ? 'register-page__chip--active' : ''}`} onClick={() => toggleSubject(sub)}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <label className="register-page__terms">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
            </label>

            <button type="submit" className="btn btn-primary btn-lg w-full register-page__submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="register-page__login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
