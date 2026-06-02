import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiSearch, FiMoon, FiSun, FiBell, FiMenu, FiX, FiLogOut, FiUser, FiBookmark, FiFileText, FiBarChart2 } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isLanding = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled || !isLanding ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <MdSchool size={24} />
          </div>
          <span className="navbar__logo-text">
            Edu<span className="navbar__logo-accent">Verse</span>
            <span className="navbar__logo-ai">AI</span>
          </span>
        </Link>

        {/* Search bar (hide on landing) */}
        {!isLanding && (
          <form className="navbar__search" onSubmit={handleSearch}>
            <FiSearch className="navbar__search-icon" />
            <input
              type="text"
              placeholder="Search topics, subjects, exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar__search-input"
            />
          </form>
        )}

        {/* Desktop Nav Links */}
        <div className="navbar__links">
          <Link to="/search" className="navbar__link">Explore</Link>
          <Link to="/community" className="navbar__link">Community</Link>
          {isAuthenticated && <Link to="/roadmap" className="navbar__link">Roadmap</Link>}
        </div>

        {/* Right Actions */}
        <div className="navbar__actions">
          <button onClick={toggleTheme} className="navbar__icon-btn" aria-label="Toggle theme">
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              <button className="navbar__icon-btn" onClick={() => navigate('/dashboard')} aria-label="Notifications">
                <FiBell size={20} />
              </button>
              <div className="navbar__profile" ref={profileRef}>
                <button className="navbar__avatar-btn" onClick={() => setProfileOpen(!profileOpen)}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="navbar__avatar-img" />
                  ) : (
                    <div className="navbar__avatar-placeholder">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </button>
                {profileOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{user?.name}</p>
                      <p className="navbar__dropdown-email">{user?.email}</p>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link to="/dashboard" className="navbar__dropdown-item"><FiBarChart2 />Dashboard</Link>
                    <Link to="/profile" className="navbar__dropdown-item"><FiUser />Profile</Link>
                    <Link to="/notes" className="navbar__dropdown-item"><FiFileText />My Notes</Link>
                    <Link to="/playlists" className="navbar__dropdown-item"><FiBookmark />Playlists</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="navbar__dropdown-item navbar__dropdown-item--admin">
                        Admin Panel
                      </Link>
                    )}
                    <div className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={logout}>
                      <FiLogOut />Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar__auth-btns">
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary navbar__cta">Start Free</Link>
            </div>
          )}

          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <Link to="/search" className="navbar__mobile-link">🔍 Explore</Link>
          <Link to="/community" className="navbar__mobile-link">💬 Community</Link>
          <Link to="/roadmap" className="navbar__mobile-link">🗺️ Roadmap</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar__mobile-link">📊 Dashboard</Link>
              <Link to="/notes" className="navbar__mobile-link">📝 Notes</Link>
              <Link to="/quiz" className="navbar__mobile-link">🧠 Quiz</Link>
              <button className="navbar__mobile-link navbar__mobile-logout" onClick={logout}>🚪 Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__mobile-link">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{margin: '0.5rem 1rem'}}>Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
