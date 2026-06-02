import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FiUsers, FiSearch, FiFileText, FiAward, FiTrendingUp } from 'react-icons/fi';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchAdminStats(); }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/analytics/admin');
      setStats(res.data.stats);
      setRecentUsers(res.data.recentUsers);
      setPopularSearches(res.data.popularSearches || []);
      setUserGrowth(res.data.userGrowth || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async (search = '') => {
    try {
      const res = await api.get('/analytics/users', { params: { search } });
      setUsers(res.data.users);
      setUsersTotal(res.data.total);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (tab === 'users') fetchUsers(searchTerm); }, [tab, searchTerm]);

  const statCards = [
    { icon: <FiUsers />, label: 'Total Users', value: stats.totalUsers || 0, color: '#2563eb' },
    { icon: <FiSearch />, label: 'Total Searches', value: stats.totalSearches || 0, color: '#7c3aed' },
    { icon: <FiAward />, label: 'Quizzes Taken', value: stats.totalQuizzes || 0, color: '#10b981' },
    { icon: <FiFileText />, label: 'Notes Created', value: stats.totalNotes || 0, color: '#f59e0b' },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="admin container">
        <div className="admin__header">
          <h1>⚙️ Admin Dashboard</h1>
          <p className="text-secondary">Welcome back, {user?.name}</p>
        </div>

        <div className="admin__tabs">
          {['overview', 'users', 'analytics'].map(t => (
            <button key={t} className={`admin__tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="admin__overview animate-fade-in">
            <div className="admin__stats">
              {statCards.map(s => (
                <div key={s.label} className="admin__stat-card card">
                  <div className="admin__stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                  <div>
                    <h3 className="admin__stat-value">{s.value.toLocaleString()}</h3>
                    <p className="admin__stat-label">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin__charts">
              <div className="card admin__chart">
                <h3><FiTrendingUp /> User Growth</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card admin__chart">
                <h3>🔥 Popular Searches</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={popularSearches.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card admin__recent">
              <h3>👥 Recent Users</h3>
              <div className="admin__users-list">
                {recentUsers.map(u => (
                  <div key={u._id} className="admin__user-row">
                    <div className="admin__user-avatar">{u.name?.charAt(0)?.toUpperCase()}</div>
                    <div className="admin__user-info">
                      <p className="admin__user-name">{u.name}</p>
                      <p className="admin__user-email">{u.email}</p>
                    </div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span>
                    <span className="admin__user-date">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="admin__users-tab animate-fade-in">
            <div className="admin__users-toolbar">
              <input className="form-input" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{maxWidth:300}} />
              <span className="text-secondary">{usersTotal} total users</span>
            </div>
            <div className="card">
              <table className="admin__table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><div className="admin__user-cell"><div className="admin__user-avatar-sm">{u.name?.charAt(0)?.toUpperCase()}</div>{u.name}</div></td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-neutral'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="admin__analytics animate-fade-in">
            <div className="card" style={{padding:'2rem', textAlign:'center'}}>
              <div className="empty-state__icon">📊</div>
              <h3>Advanced Analytics Coming Soon</h3>
              <p className="text-secondary">Detailed engagement metrics, search patterns, and user behavior insights</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
