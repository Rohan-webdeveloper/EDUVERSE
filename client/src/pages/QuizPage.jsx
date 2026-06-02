import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiClock, FiAward, FiArrowRight, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import './QuizPage.css';

const EXAMS = ['JEE', 'NEET', 'UPSC', 'SSC', 'GATE', 'CAT'];
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Computer Science'];

export default function QuizPage() {
  const { user } = useAuth();
  const [view, setView] = useState('setup'); // setup | quiz | results
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [exam, setExam] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const generateQuiz = async () => {
    if (!topic.trim()) return toast.error('Enter a topic');
    setLoading(true);
    try {
      const res = await api.post('/ai/quiz', { topic, subject, exam, difficulty, numQuestions });
      setQuestions(res.data.questions);
      setSelectedAnswers({});
      setCurrentQ(0);
      setView('quiz');
      setTimeLeft(res.data.questions.length * 60);
    } catch (err) {
      toast.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIdx, ansIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: ansIdx }));
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const answeredQs = questions.map((q, i) => ({
        ...q,
        selectedAnswer: selectedAnswers[i] ?? -1,
      }));
      const res = await api.post('/ai/quiz/submit', { topic, subject, exam, difficulty, questions: answeredQs, timeTaken: 0 });
      setResults(res.data.result);
      setFeedback(res.data.feedback);
      setView('results');
    } catch (err) {
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setView('setup');
    setQuestions([]);
    setSelectedAnswers({});
    setResults(null);
    setFeedback('');
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="quiz-page container">
        {/* SETUP VIEW */}
        {view === 'setup' && (
          <div className="quiz-page__setup animate-fade-in">
            <div className="quiz-page__setup-header">
              <h1 className="quiz-page__title">🧠 AI Quiz Generator</h1>
              <p className="quiz-page__subtitle">Test your knowledge with AI-generated quizzes</p>
            </div>
            <div className="quiz-page__setup-card card">
              <div className="form-group">
                <label className="form-label">Topic *</label>
                <input className="form-input" placeholder="e.g., Newton's Laws, Organic Chemistry, Indian History..." value={topic} onChange={e => setTopic(e.target.value)} />
              </div>
              <div className="quiz-page__setup-row">
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Subject</label>
                  <select className="form-input" value={subject} onChange={e => setSubject(e.target.value)}>
                    <option value="">Select</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Exam</label>
                  <select className="form-input" value={exam} onChange={e => setExam(e.target.value)}>
                    <option value="">Select</option>
                    {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <div className="quiz-page__diff-btns">
                  {['beginner', 'intermediate', 'advanced'].map(d => (
                    <button key={d} className={`quiz-page__diff-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Questions</label>
                <div className="quiz-page__num-btns">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n} className={`quiz-page__num-btn ${numQuestions === n ? 'active' : ''}`} onClick={() => setNumQuestions(n)}>{n}</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary btn-lg w-full" onClick={generateQuiz} disabled={loading}>
                {loading ? <><span className="spinner" /> Generating Quiz...</> : '🚀 Generate Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* QUIZ VIEW */}
        {view === 'quiz' && questions.length > 0 && (
          <div className="quiz-page__active animate-fade-in">
            <div className="quiz-page__progress-bar">
              <div className="quiz-page__progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>
            <p className="quiz-page__progress-text">Question {currentQ + 1} of {questions.length}</p>

            <div className="quiz-page__question-card card">
              <h3 className="quiz-page__question">{questions[currentQ].question}</h3>
              <div className="quiz-page__options">
                {questions[currentQ].options.map((opt, i) => (
                  <button key={i} className={`quiz-page__option ${selectedAnswers[currentQ] === i ? 'quiz-page__option--selected' : ''}`} onClick={() => selectAnswer(currentQ, i)}>
                    <span className="quiz-page__option-letter">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="quiz-page__nav">
              <button className="btn btn-secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>
                <FiArrowLeft /> Previous
              </button>
              <div className="quiz-page__dots">
                {questions.map((_, i) => (
                  <button key={i} className={`quiz-page__dot ${i === currentQ ? 'active' : ''} ${selectedAnswers[i] !== undefined ? 'answered' : ''}`} onClick={() => setCurrentQ(i)} />
                ))}
              </div>
              {currentQ < questions.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>
                  Next <FiArrowRight />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submitQuiz} disabled={loading}>
                  {loading ? 'Submitting...' : '✅ Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {view === 'results' && results && (
          <div className="quiz-page__results animate-fade-in">
            <div className="quiz-page__score-card card">
              <div className="quiz-page__score-circle" style={{ '--pct': results.percentage }}>
                <span className="quiz-page__score-num">{results.percentage}%</span>
              </div>
              <h2>{results.passed ? '🎉 Congratulations!' : '📚 Keep Practicing!'}</h2>
              <p className="quiz-page__score-detail">{results.score}/{results.totalQuestions} correct answers</p>
              <span className={`badge ${results.passed ? 'badge-success' : 'badge-warning'}`}>
                {results.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
              </span>
            </div>

            {/* Question Review */}
            <div className="quiz-page__review">
              <h3>📋 Question Review</h3>
              {results.questions.map((q, i) => (
                <div key={i} className={`quiz-page__review-item card ${q.isCorrect ? 'quiz-page__review-item--correct' : 'quiz-page__review-item--wrong'}`}>
                  <div className="quiz-page__review-header">
                    {q.isCorrect ? <FiCheckCircle className="quiz-page__review-icon--correct" /> : <FiXCircle className="quiz-page__review-icon--wrong" />}
                    <span>Q{i + 1}: {q.question}</span>
                  </div>
                  <p className="quiz-page__review-answer">Correct: <strong>{q.options[q.correctAnswer]}</strong></p>
                  {q.explanation && <p className="quiz-page__review-exp">💡 {q.explanation}</p>}
                </div>
              ))}
            </div>

            {feedback && (
              <div className="quiz-page__feedback card">
                <h3>🤖 AI Feedback</h3>
                <div className="markdown-content"><ReactMarkdown>{feedback}</ReactMarkdown></div>
              </div>
            )}

            <div className="quiz-page__results-actions">
              <button className="btn btn-primary btn-lg" onClick={resetQuiz}><FiRefreshCw /> New Quiz</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
