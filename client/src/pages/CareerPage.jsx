import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { FiCompass, FiRefreshCw } from 'react-icons/fi';
import './CareerPage.css';

export default function CareerPage() {
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [level, setLevel] = useState('student');
  const [goal, setGoal] = useState('');
  const [guidance, setGuidance] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!interests.trim()) return toast.error('Enter your interests');
    setLoading(true);
    try {
      const res = await api.post('/ai/career', { interests, skills, currentLevel: level, goal });
      setGuidance(res.data.guidance);
      toast.success('Career guidance ready!');
    } catch (err) { toast.error('Failed to generate'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="career-page container">
        <div className="career-page__header">
          <h1>🧭 AI Career Guidance</h1>
          <p>Get personalized career advice based on your interests and skills</p>
        </div>

        {!guidance ? (
          <div className="career-page__form card animate-fade-in">
            <div className="form-group">
              <label className="form-label">Your Interests *</label>
              <textarea className="form-input" rows={3} placeholder="e.g., I love coding, problem-solving, and building websites..." value={interests} onChange={e => setInterests(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Current Skills</label>
              <input className="form-input" placeholder="e.g., Python, JavaScript, Data Analysis..." value={skills} onChange={e => setSkills(e.target.value)} />
            </div>
            <div className="career-page__row">
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Current Level</label>
                <select className="form-input" value={level} onChange={e => setLevel(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="graduate">Graduate</option>
                  <option value="working">Working Professional</option>
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Career Goal (optional)</label>
                <input className="form-input" placeholder="e.g., Software Engineer at Google" value={goal} onChange={e => setGoal(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary btn-lg w-full" onClick={generate} disabled={loading}>
              {loading ? <><span className="spinner" /> Generating guidance...</> : <><FiCompass /> Get Career Guidance</>}
            </button>
          </div>
        ) : (
          <div className="career-page__result animate-fade-in">
            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'1rem'}}>
              <button className="btn btn-ghost" onClick={() => setGuidance('')}><FiRefreshCw /> Generate New</button>
            </div>
            <div className="card" style={{padding:'2rem'}}>
              <div className="markdown-content"><ReactMarkdown>{guidance}</ReactMarkdown></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
