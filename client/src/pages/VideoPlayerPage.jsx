import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import VideoCard from '../components/video/VideoCard';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { FiBookmark, FiShare2, FiPlus, FiSend, FiCopy, FiFileText, FiMessageCircle, FiHelpCircle } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import './VideoPlayerPage.css';

const NOTE_TYPES = [
  { value: 'short', label: '📝 Short Notes' },
  { value: 'long', label: '📖 Detailed Notes' },
  { value: 'formula', label: '📐 Formula Sheet' },
  { value: 'concepts', label: '💡 Key Concepts' },
  { value: 'questions', label: '❓ Important Questions' },
];

export default function VideoPlayerPage() {
  const { id: videoId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const videoTitle = searchParams.get('title') || '';
  const channelTitle = searchParams.get('channel') || '';

  const [activeTab, setActiveTab] = useState('doubt');
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtAnswer, setDoubtAnswer] = useState('');
  const [noteType, setNoteType] = useState('short');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    fetchRelated();
    fetchSummary();
  }, [videoId]);

  const fetchRelated = async () => {
    try {
      const topic = videoTitle.split('|')[0].split('-')[0].trim().slice(0, 40);
      if (topic) {
        const res = await api.get('/videos/search', { params: { q: topic } });
        setRelatedVideos(res.data.videos?.filter(v => v.id !== videoId)?.slice(0, 4) || []);
      }
    } catch (err) { /* ignore */ }
  };

  const fetchSummary = async () => {
    if (!isAuthenticated || !videoTitle) return;
    try {
      const res = await api.post('/ai/summary', { videoTitle, channelTitle });
      setSummary(res.data.summary);
    } catch (err) { /* ignore */ }
  };

  const handleDoubt = async () => {
    if (!doubtInput.trim()) return;
    if (!isAuthenticated) return toast.error('Please login to use AI features');
    setLoadingAI(true);
    try {
      const res = await api.post('/ai/doubt', { question: doubtInput });
      setDoubtAnswer(res.data.answer);
    } catch (err) {
      toast.error('Failed to get answer');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!isAuthenticated) return toast.error('Please login to use AI features');
    setLoadingAI(true);
    try {
      const topic = videoTitle.split('|')[0].trim();
      const res = await api.post('/ai/notes', { topic, videoTitle, type: noteType, videoId, channelTitle });
      setNotes(res.data.content);
      toast.success('Notes generated!');
    } catch (err) {
      toast.error('Failed to generate notes');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return toast.error('Please login to bookmark');
    try {
      const res = await api.post('/videos/bookmark', { videoId, videoTitle, channelTitle });
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.message);
    } catch (err) { toast.error('Failed'); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="video-page container">
        <div className="video-page__layout">
          {/* Main Video Area */}
          <main className="video-page__main">
            <div className="video-page__player-wrapper">
              <iframe
                className="video-page__player"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Info */}
            <div className="video-page__info">
              <h1 className="video-page__title">{decodeURIComponent(videoTitle) || 'Educational Video'}</h1>
              <div className="video-page__meta">
                <span className="video-page__channel"><MdSchool size={16} /> {decodeURIComponent(channelTitle) || 'Educator'}</span>
              </div>
              <div className="video-page__actions">
                <button className={`btn btn-secondary btn-sm ${bookmarked ? 'video-page__bookmarked' : ''}`} onClick={handleBookmark}>
                  <FiBookmark /> {bookmarked ? 'Saved' : 'Save'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleShare}><FiShare2 /> Share</button>
                <Link to={`/playlists`} className="btn btn-secondary btn-sm"><FiPlus /> Playlist</Link>
              </div>
            </div>

            {/* AI Summary */}
            {summary && (
              <div className="video-page__summary card">
                <h3>✨ AI Summary</h3>
                <div className="markdown-content"><ReactMarkdown>{summary}</ReactMarkdown></div>
              </div>
            )}

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div className="video-page__related">
                <h3 className="video-page__related-title">Related Videos</h3>
                <div className="video-page__related-grid">
                  {relatedVideos.map(v => <VideoCard key={v.id} video={v} />)}
                </div>
              </div>
            )}
          </main>

          {/* AI Sidebar */}
          <aside className="video-page__sidebar">
            <div className="video-page__sidebar-header">
              <h3>🤖 AI Assistant</h3>
            </div>
            <div className="video-page__sidebar-tabs">
              <button className={`video-page__sidebar-tab ${activeTab === 'doubt' ? 'active' : ''}`} onClick={() => setActiveTab('doubt')}>
                <FiHelpCircle size={14} /> Doubts
              </button>
              <button className={`video-page__sidebar-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                <FiFileText size={14} /> Notes
              </button>
            </div>

            <div className="video-page__sidebar-content">
              {activeTab === 'doubt' && (
                <div className="video-page__doubt">
                  <textarea
                    className="form-input video-page__doubt-input"
                    placeholder="Ask any doubt about this topic..."
                    value={doubtInput}
                    onChange={e => setDoubtInput(e.target.value)}
                    rows={3}
                  />
                  <button className="btn btn-primary w-full" onClick={handleDoubt} disabled={loadingAI || !doubtInput.trim()}>
                    {loadingAI ? <><span className="spinner" /> Thinking...</> : <><FiSend /> Ask AI</>}
                  </button>
                  {doubtAnswer && (
                    <div className="video-page__ai-response markdown-content">
                      <ReactMarkdown>{doubtAnswer}</ReactMarkdown>
                      <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(doubtAnswer); toast.success('Copied!'); }}>
                        <FiCopy size={12} /> Copy
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="video-page__notes-gen">
                  <select className="form-input" value={noteType} onChange={e => setNoteType(e.target.value)}>
                    {NOTE_TYPES.map(nt => <option key={nt.value} value={nt.value}>{nt.label}</option>)}
                  </select>
                  <button className="btn btn-primary w-full" onClick={handleGenerateNotes} disabled={loadingAI}>
                    {loadingAI ? <><span className="spinner" /> Generating...</> : <><FiFileText /> Generate Notes</>}
                  </button>
                  {notes && (
                    <div className="video-page__ai-response markdown-content">
                      <ReactMarkdown>{notes}</ReactMarkdown>
                      <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(notes); toast.success('Copied!'); }}>
                        <FiCopy size={12} /> Copy
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
