import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { FiMap, FiDownload, FiRefreshCw } from 'react-icons/fi';
import './RoadmapPage.css';

const DURATIONS = ['1 month', '2 months', '3 months', '6 months', '1 year'];
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Computer Science', 'English'];

export default function RoadmapPage() {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('3 months');
  const [level, setLevel] = useState('beginner');
  const [subjects, setSubjects] = useState([]);
  const [roadmap, setRoadmap] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSubject = (s) => setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const generate = async () => {
    if (!goal.trim()) return toast.error('Please enter your goal');
    setLoading(true);
    try {
      const res = await api.post('/ai/roadmap', { goal, duration, currentLevel: level, subjects });
      setRoadmap(res.data.roadmap);
      toast.success('Roadmap generated!');
    } catch (err) {
      toast.error('Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const downloadRoadmap = () => {
    const blob = new Blob([roadmap], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `roadmap-${goal.slice(0, 20)}.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="roadmap-page container">
        <div className="roadmap-page__header">
          <h1>🗺️ AI Study Roadmap</h1>
          <p>Get a personalized, week-by-week study plan powered by AI</p>
        </div>

        {!roadmap ? (
          <div className="roadmap-page__form card animate-fade-in">
            <div className="form-group">
              <label className="form-label">What's your goal? *</label>
              <textarea className="form-input" rows={3} placeholder="e.g., I want to crack JEE in 6 months starting from scratch..." value={goal} onChange={e => setGoal(e.target.value)} />
            </div>
            <div className="roadmap-page__row">
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Timeframe</label>
                <select className="form-input" value={duration} onChange={e => setDuration(e.target.value)}>
                  {DURATIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Current Level</label>
                <div className="roadmap-page__level-btns">
                  {['beginner', 'intermediate', 'advanced'].map(l => (
                    <button key={l} className={`roadmap-page__level-btn ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Focus Subjects</label>
              <div className="roadmap-page__chips">
                {SUBJECTS.map(s => (
                  <button key={s} className={`roadmap-page__chip ${subjects.includes(s) ? 'active' : ''}`} onClick={() => toggleSubject(s)}>{s}</button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-lg w-full" onClick={generate} disabled={loading}>
              {loading ? <><span className="spinner" /> Generating roadmap...</> : <><FiMap /> Generate My Roadmap</>}
            </button>
          </div>
        ) : (
          <div className="roadmap-page__result animate-fade-in">
            <div className="roadmap-page__result-actions">
              <button className="btn btn-secondary" onClick={downloadRoadmap}><FiDownload /> Download</button>
              <button className="btn btn-ghost" onClick={() => setRoadmap('')}><FiRefreshCw /> Generate New</button>
            </div>
            <div className="roadmap-page__content card">
              <div className="markdown-content"><ReactMarkdown>{roadmap}</ReactMarkdown></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
