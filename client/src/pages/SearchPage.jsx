import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import VideoCard from '../components/video/VideoCard';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import './SearchPage.css';

const EXAMS = ['JEE', 'NEET', 'UPSC', 'SSC', 'GATE', 'CAT', 'CUET', 'Class 10', 'Class 12'];
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Computer Science'];
const PROVIDERS = ['Physics Wallah', 'Khan Academy', 'Unacademy', 'Vedantu', 'Adda247', 'StudyIQ'];
const DURATIONS = [{ label: 'Short (< 10 min)', value: 'short' }, { label: 'Medium (10-30 min)', value: 'medium' }, { label: 'Long (> 30 min)', value: 'long' }];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    exam: searchParams.get('exam') || '',
    subject: searchParams.get('subject') || '',
    provider: searchParams.get('provider') || '',
    duration: searchParams.get('duration') || '',
    difficulty: searchParams.get('difficulty') || '',
  });

  const searchVideos = useCallback(async (q, f, pageToken = '') => {
    if (!q) return;
    setLoading(true);
    try {
      const params = { q, ...f };
      if (pageToken) params.pageToken = pageToken;
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await api.get('/videos/search', { params });
      if (pageToken) {
        setVideos(prev => {
          const uniqueNew = res.data.videos.filter(v => !prev.some(p => p.id === v.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setVideos(res.data.videos);
      }
      setNextPageToken(res.data.nextPageToken);
      setTotalResults(res.data.totalResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      searchVideos(q, filters);
    }
  }, [searchParams, filters, searchVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: filters[key] === value ? '' : value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({ exam: '', subject: '', provider: '', duration: '', difficulty: '' });
  };

  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  const loadMore = () => {
    if (nextPageToken) {
      searchVideos(query, filters, nextPageToken);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="search-page">
        <div className="container">
          {/* Search Header */}
          <div className="search-page__header">
            <form className="search-page__search-bar" onSubmit={handleSearch}>
              <FiSearch className="search-page__search-icon" />
              <input
                type="text"
                className="search-page__search-input"
                placeholder="Search for topics, chapters, subjects, exams..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <button className="search-page__filter-toggle btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              <FiFilter /> Filters {activeFilters.length > 0 && <span className="badge badge-primary">{activeFilters.length}</span>}
            </button>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="search-page__active-filters">
              {activeFilters.map(([key, val]) => (
                <span key={key} className="search-page__filter-chip">
                  {val}
                  <button onClick={() => updateFilter(key, val)}><FiX size={12} /></button>
                </span>
              ))}
              <button className="search-page__clear-filters" onClick={clearFilters}>Clear all</button>
            </div>
          )}

          <div className="search-page__layout">
            {showFilters && (
              <div className="search-page__backdrop" onClick={() => setShowFilters(false)} />
            )}
            {/* Filter Sidebar */}
            <aside className={`search-page__sidebar ${showFilters ? 'search-page__sidebar--open' : ''}`}>
              <div className="search-page__sidebar-header-mobile">
                <h3>Filters</h3>
                <button className="search-page__sidebar-close" onClick={() => setShowFilters(false)}>
                  <FiX size={20} />
                </button>
              </div>
              <div className="search-page__filter-group">
                <h4 className="search-page__filter-title"><FiChevronDown /> Exam</h4>
                <div className="search-page__filter-options">
                  {EXAMS.map(e => (
                    <button key={e} className={`search-page__filter-btn ${filters.exam === e ? 'active' : ''}`} onClick={() => updateFilter('exam', e)}>{e}</button>
                  ))}
                </div>
              </div>
              <div className="search-page__filter-group">
                <h4 className="search-page__filter-title"><FiChevronDown /> Subject</h4>
                <div className="search-page__filter-options">
                  {SUBJECTS.map(s => (
                    <button key={s} className={`search-page__filter-btn ${filters.subject === s ? 'active' : ''}`} onClick={() => updateFilter('subject', s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="search-page__filter-group">
                <h4 className="search-page__filter-title"><FiChevronDown /> Provider</h4>
                <div className="search-page__filter-options">
                  {PROVIDERS.map(p => (
                    <button key={p} className={`search-page__filter-btn ${filters.provider === p ? 'active' : ''}`} onClick={() => updateFilter('provider', p)}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="search-page__filter-group">
                <h4 className="search-page__filter-title"><FiChevronDown /> Duration</h4>
                <div className="search-page__filter-options">
                  {DURATIONS.map(d => (
                    <button key={d.value} className={`search-page__filter-btn ${filters.duration === d.value ? 'active' : ''}`} onClick={() => updateFilter('duration', d.value)}>{d.label}</button>
                  ))}
                </div>
              </div>
              <div className="search-page__filter-group">
                <h4 className="search-page__filter-title"><FiChevronDown /> Difficulty</h4>
                <div className="search-page__filter-options">
                  {DIFFICULTIES.map(d => (
                    <button key={d} className={`search-page__filter-btn ${filters.difficulty === d ? 'active' : ''}`} onClick={() => updateFilter('difficulty', d)}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Results */}
            <main className="search-page__results">
              {searchParams.get('q') && (
                <p className="search-page__result-count">
                  {loading ? 'Searching...' : `Showing ${videos.length} results for "${searchParams.get('q')}"`}
                </p>
              )}

              {loading && videos.length === 0 ? (
                <div className="search-page__grid">
                  {[...Array(9)].map((_, i) => <VideoCard key={i} />)}
                </div>
              ) : videos.length > 0 ? (
                <>
                  <div className="search-page__grid">
                    {videos.map(video => <VideoCard key={video.id} video={video} />)}
                  </div>
                  {nextPageToken && (
                    <div className="search-page__load-more">
                      <button className="btn btn-secondary btn-lg" onClick={loadMore} disabled={loading}>
                        {loading ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              ) : searchParams.get('q') && !loading ? (
                <div className="empty-state">
                  <div className="empty-state__icon">🔍</div>
                  <h3 className="empty-state__title">No results found</h3>
                  <p className="empty-state__text">Try different keywords or adjust your filters</p>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state__icon">📚</div>
                  <h3 className="empty-state__title">Search for educational videos</h3>
                  <p className="empty-state__text">Find content from Physics Wallah, Khan Academy, Unacademy, and more</p>
                  <div className="search-page__suggestions">
                    {['Electrostatics', 'Organic Chemistry', 'Integration', 'French Revolution', 'NEET Biology'].map(s => (
                      <button key={s} className="search-page__suggestion" onClick={() => { setQuery(s); setSearchParams({ q: s }); }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
