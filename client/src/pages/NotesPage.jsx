import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiBookmark, FiSearch, FiFileText, FiZap } from 'react-icons/fi';
import './NotesPage.css';

const NOTE_TYPES = ['short', 'long', 'formula', 'concepts', 'questions'];

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showGen, setShowGen] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genType, setGenType] = useState('short');
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data.notes);
    } catch (err) { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  const generateNote = async () => {
    if (!genTopic.trim()) return toast.error('Enter a topic');
    setGenLoading(true);
    try {
      const res = await api.post('/ai/notes', { topic: genTopic, type: genType, videoId: 'standalone', videoTitle: genTopic });
      await fetchNotes();
      toast.success('Notes generated!');
      setShowGen(false);
      setGenTopic('');
    } catch (err) { toast.error('Failed to generate'); }
    finally { setGenLoading(false); }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      if (selectedNote?._id === id) setSelectedNote(null);
      toast.success('Note deleted');
    } catch (err) { toast.error('Failed'); }
  };

  const togglePin = async (id) => {
    try {
      await api.put(`/notes/${id}/pin`);
      fetchNotes();
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = notes.filter(n => n.videoTitle?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="notes-page container">
        <div className="notes-page__header">
          <h1>📝 My Notes</h1>
          <div className="notes-page__actions">
            <button className="btn btn-primary" onClick={() => setShowGen(true)}><FiZap /> AI Generate</button>
          </div>
        </div>

        {showGen && (
          <div className="notes-page__gen card animate-slide-up">
            <h3>✨ AI Notes Generator</h3>
            <div className="notes-page__gen-form">
              <input className="form-input" placeholder="Enter topic..." value={genTopic} onChange={e => setGenTopic(e.target.value)} />
              <select className="form-input" value={genType} onChange={e => setGenType(e.target.value)}>
                {NOTE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Notes</option>)}
              </select>
              <button className="btn btn-primary" onClick={generateNote} disabled={genLoading}>
                {genLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        )}

        <div className="notes-page__layout">
          {/* Notes List */}
          <div className="notes-page__list">
            <div className="notes-page__search">
              <FiSearch className="notes-page__search-icon" />
              <input className="notes-page__search-input" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? (
              <div className="notes-page__skeleton">{[1,2,3].map(i => <div key={i} className="skeleton" style={{height:80, marginBottom:8}} />)}</div>
            ) : filtered.length > 0 ? (
              filtered.map(note => (
                <div key={note._id} className={`notes-page__item ${selectedNote?._id === note._id ? 'active' : ''}`} onClick={() => setSelectedNote(note)}>
                  <div className="notes-page__item-top">
                    <h4>{note.videoTitle || 'Untitled Note'}</h4>
                    {note.isPinned && <FiBookmark size={12} className="notes-page__pin-icon" />}
                  </div>
                  <div className="notes-page__item-meta">
                    {note.aiGenerated && <span className="badge badge-primary">AI</span>}
                    <span className="badge badge-neutral">{note.type}</span>
                    <span className="notes-page__item-date">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="notes-page__item-actions">
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); togglePin(note._id); }}><FiBookmark size={12} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); deleteNote(note._id); }}><FiTrash2 size={12} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state"><div className="empty-state__icon">📝</div><p className="empty-state__text">No notes yet. Generate some with AI!</p></div>
            )}
          </div>

          {/* Note Viewer */}
          <div className="notes-page__viewer">
            {selectedNote ? (
              <div className="notes-page__viewer-content animate-fade-in">
                <h2>{selectedNote.videoTitle}</h2>
                <div className="notes-page__viewer-meta">
                  {selectedNote.aiGenerated && <span className="badge badge-primary">AI Generated</span>}
                  <span className="badge badge-neutral">{selectedNote.type}</span>
                </div>
                <div className="markdown-content"><ReactMarkdown>{selectedNote.content}</ReactMarkdown></div>
              </div>
            ) : (
              <div className="notes-page__viewer-empty">
                <FiFileText size={48} className="text-muted" />
                <p>Select a note to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
