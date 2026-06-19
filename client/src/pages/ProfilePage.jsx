import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiCalendar, FiAward, FiSave, FiClock, FiBookmark, FiFileText } from 'react-icons/fi';
import './ProfilePage.css';

const EXAMS = ['JEE', 'NEET', 'UPSC', 'SSC', 'GATE', 'CAT', 'CUET', 'Class 10', 'Class 12'];
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Computer Science'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [exam, setExam] = useState(user?.preferences?.exam || '');
  const [subjects, setSubjects] = useState(user?.preferences?.subjects || []);
  const [saving, setSaving] = useState(false);

  const toggleSubject = (s) => setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { name, preferences: { ...user.preferences, exam, subjects } });
      if (updateUser) updateUser({ ...user, name, preferences: { ...user.preferences, exam, subjects } });
      toast.success('Profile updated!');
    } catch (err) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="profile-page container">
        {/* Hero */}
        <div className="profile-page__hero">
          <div className="profile-page__hero-bg" />
          <div className="profile-page__hero-content">
            <div className="profile-page__avatar">
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user?.name?.charAt(0)?.toUpperCase()}</span>}
            </div>
            <div className="profile-page__hero-info">
              <h1>{user?.name}</h1>
              <p className="profile-page__email"><FiMail size={14} /> {user?.email}</p>
              <div className="profile-page__badges">
                <span className="badge badge-primary">{user?.role}</span>
                {user?.stats?.currentStreak > 0 && <span className="badge badge-success">🔥 {user.stats.currentStreak} day streak</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-page__grid">
          {/* Stats */}
          <div className="profile-page__stats">
            <div className="profile-page__stat card">
              <FiClock className="profile-page__stat-icon" />
              <div><h3>{user?.stats?.totalWatchTime || 0}</h3><p>Minutes Watched</p></div>
            </div>
            <div className="profile-page__stat card">
              <FiBookmark className="profile-page__stat-icon" />
              <div><h3>{user?.stats?.videosWatched || 0}</h3><p>Videos Watched</p></div>
            </div>
            <div className="profile-page__stat card">
              <FiAward className="profile-page__stat-icon" />
              <div><h3>{user?.stats?.longestStreak || 0}</h3><p>Longest Streak</p></div>
            </div>
            <div className="profile-page__stat card">
              <FiCalendar className="profile-page__stat-icon" />
              <div><h3>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</h3><p>Joined</p></div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="profile-page__edit card">
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email || ''} readOnly disabled style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'var(--bg-secondary)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Preparing for</label>
              <select className="form-input" value={exam} onChange={e => setExam(e.target.value)}>
                <option value="">Select exam</option>
                {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Interested Subjects</label>
              <div className="profile-page__chips">
                {SUBJECTS.map(s => (
                  <button key={s} className={`profile-page__chip ${subjects.includes(s) ? 'active' : ''}`} onClick={() => toggleSubject(s)}>{s}</button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><FiSave /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
