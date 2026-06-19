import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiMessageSquare, FiSearch, FiPlus, FiThumbsUp, FiEye,
  FiClock, FiTag, FiChevronDown, FiChevronUp, FiSend,
  FiCheckCircle, FiFilter, FiTrendingUp, FiBookOpen,
  FiX, FiUser, FiAward, FiHash, FiAlertCircle,
} from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi'
import toast from 'react-hot-toast'
import api from '../services/api.js'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/layout/Navbar'
import './CommunityPage.css'

// ─── Constants ────────────────────────────────────────────────────────────────
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Computer Science', 'Economics', 'Political Science']
const EXAMS = ['JEE Main', 'JEE Advanced', 'NEET', 'UPSC', 'CAT', 'GATE', 'SSC', 'CLAT', 'NDA', 'Class 10', 'Class 12']
const POPULAR_TAGS = ['calculus', 'organic-chemistry', 'thermodynamics', 'trigonometry', 'essay-writing', 'genetics', 'mechanics', 'current-affairs', 'mock-test', 'strategy']

const MOCK_DISCUSSIONS = [
  {
    _id: '1', title: 'How to approach Integration by Parts for JEE Advanced?',
    content: `I've been struggling with Integration by Parts problems in JEE Advanced papers. The standard LIATE rule works for simple cases but breaks down for composite functions. Can someone explain a more systematic approach?\n\nSpecifically, I'm stuck on problems like ∫x²·sin(x)·eˣ dx where multiple applications are needed.`,
    author: { name: 'Arjun Sharma', avatar: null, _id: 'u1' },
    tags: ['calculus', 'integration', 'jee-advanced'],
    subject: 'Mathematics', exam: 'JEE Advanced',
    upvotes: 47, upvotedBy: [],
    answerCount: 12, views: 342, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    solved: true,
    answers: [
      { _id: 'a1', content: 'Great question! The key insight is to apply LIATE recursively. For ∫x²·sin(x)·eˣ dx, first group eˣ·sin(x) as a product and solve that integral using the standard formula for ∫eˣ·sin(x)dx = eˣ(sin x - cos x)/2. Then integrate ∫x²·[eˣ(sin x - cos x)/2]dx by parts twice more.', author: { name: 'Priya Nair', avatar: null }, upvotes: 23, createdAt: new Date(Date.now() - 3600000).toISOString(), isAccepted: true },
      { _id: 'a2', content: 'Another approach: Use the tabular integration method (also called the tic-tac-toe method). Draw a table with derivatives of one function and integrals of the other, then multiply diagonally with alternating signs.', author: { name: 'Rohit Verma', avatar: null }, upvotes: 15, createdAt: new Date(Date.now() - 1800000).toISOString(), isAccepted: false },
    ],
  },
  {
    _id: '2', title: 'Best resources for NEET Biology - Cell Division chapter?',
    content: `I need comprehensive resources for Cell Division (Mitosis & Meiosis) for NEET preparation. Which books and YouTube channels cover this topic best with NEET-level MCQs?`,
    author: { name: 'Sneha Patel', avatar: null, _id: 'u2' },
    tags: ['biology', 'neet', 'cell-division', 'resources'],
    subject: 'Biology', exam: 'NEET',
    upvotes: 31, upvotedBy: [],
    answerCount: 8, views: 215, createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    solved: false,
    answers: [
      { _id: 'a3', content: 'For NEET Biology, NCERT is the bible. For Cell Division specifically, Trueman\'s Biology and DC Pandey Biology are excellent. On YouTube, check out Vedantu NEET channel - they have a dedicated playlist for Cell Division with memory tricks for meiosis stages.', author: { name: 'Dr. Amit Kumar', avatar: null }, upvotes: 19, createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), isAccepted: false },
    ],
  },
  {
    _id: '3', title: 'UPSC Essay strategy - How to structure arguments effectively?',
    content: `I scored only 110/250 in last year\'s UPSC Essay paper. My main weakness seems to be in structuring arguments logically. How do toppers approach the essay? Any specific frameworks or templates?`,
    author: { name: 'Kavitha Reddy', avatar: null, _id: 'u3' },
    tags: ['upsc', 'essay', 'strategy', 'writing'],
    subject: 'English', exam: 'UPSC',
    upvotes: 58, upvotedBy: [],
    answerCount: 15, views: 489, createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    solved: false,
    answers: [],
  },
  {
    _id: '4', title: 'Organic Chemistry reaction mechanisms - SN1 vs SN2 confusion',
    content: `I keep mixing up SN1 and SN2 reactions in JEE questions. Specifically, how do I quickly determine which mechanism operates in a given substrate? I know the basic rules but real exam questions seem tricky.`,
    author: { name: 'Varun Gupta', avatar: null, _id: 'u4' },
    tags: ['organic-chemistry', 'jee', 'mechanisms'],
    subject: 'Chemistry', exam: 'JEE Main',
    upvotes: 22, upvotedBy: [],
    answerCount: 6, views: 178, createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    solved: true,
    answers: [],
  },
]

// ─── Utility Helpers ──────────────────────────────────────────────────────────
const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
const avatarColor = (name = '') => {
  const colors = ['#2563eb', '#7c3aed', '#db2777', '#16a34a', '#ea580c', '#0891b2']
  return colors[name.charCodeAt(0) % colors.length]
}

// ─── Avatar Component ─────────────────────────────────────────────────────────
const Avatar = ({ name = '', size = 36 }) => (
  <div className="comm-avatar" style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.38 }}>
    {getInitials(name)}
  </div>
)

// ─── Tag Chip ─────────────────────────────────────────────────────────────────
const TagChip = ({ tag, onClick }) => (
  <button className="comm-tag-chip" onClick={onClick ? () => onClick(tag) : undefined}>
    <FiHash size={10} /> {tag}
  </button>
)

// ─── Ask Question Modal ───────────────────────────────────────────────────────
const AskQuestionModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ title: '', content: '', tags: '', subject: '', exam: '' })
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => { textareaRef.current?.focus() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required')
      return
    }
    setSubmitting(true)
    try {
      const tags = form.tags.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean)
      await onSubmit({ ...form, tags })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="comm-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="comm-modal">
        <div className="comm-modal-header">
          <div className="comm-modal-title-row">
            <HiOutlineSparkles className="comm-modal-icon" />
            <h2>Ask a Question</h2>
          </div>
          <button className="comm-modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form className="comm-modal-form" onSubmit={handleSubmit}>
          <div className="comm-form-group">
            <label>Question Title *</label>
            <input
              type="text" placeholder="e.g. How to solve integration by parts problems?"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="comm-input" maxLength={200}
            />
            <span className="comm-char-count">{form.title.length}/200</span>
          </div>
          <div className="comm-form-row">
            <div className="comm-form-group">
              <label>Subject</label>
              <select className="comm-select" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="comm-form-group">
              <label>Exam</label>
              <select className="comm-select" value={form.exam} onChange={e => setForm(p => ({ ...p, exam: e.target.value }))}>
                <option value="">Select exam</option>
                {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="comm-form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text" placeholder="e.g. calculus, integration, jee"
              value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              className="comm-input"
            />
          </div>
          <div className="comm-form-group">
            <label>Detailed Question *</label>
            <textarea
              ref={textareaRef} rows={8}
              placeholder="Describe your question in detail. Include what you've tried, relevant formulas, and specific doubts..."
              value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className="comm-textarea"
            />
          </div>
          <div className="comm-modal-footer">
            <button type="button" className="comm-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="comm-btn-primary" disabled={submitting}>
              {submitting ? <><span className="comm-spinner" /> Posting...</> : <><FiSend /> Post Question</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Answer Card ──────────────────────────────────────────────────────────────
const AnswerCard = ({ answer, isAccepted }) => (
  <div className={`comm-answer-card ${isAccepted ? 'comm-answer-accepted' : ''}`}>
    {isAccepted && (
      <div className="comm-accepted-badge">
        <FiCheckCircle /> Accepted Answer
      </div>
    )}
    <div className="comm-answer-header">
      <Avatar name={answer.author?.name} size={32} />
      <div>
        <span className="comm-answer-author">{answer.author?.name}</span>
        <span className="comm-answer-time">{timeAgo(answer.createdAt)}</span>
      </div>
    </div>
    <p className="comm-answer-content">{answer.content}</p>
    <div className="comm-answer-footer">
      <button className="comm-vote-btn-sm">
        <FiThumbsUp size={12} /> {answer.upvotes}
      </button>
    </div>
  </div>
)

// ─── Add Answer Form ──────────────────────────────────────────────────────────
const AddAnswerForm = ({ onSubmit, loading }) => {
  const [content, setContent] = useState('')
  const { isAuthenticated } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) { toast.error('Answer cannot be empty'); return }
    onSubmit(content)
    setContent('')
  }

  if (!isAuthenticated) return (
    <div className="comm-login-prompt">
      <FiAlertCircle /> <span>Please <a href="/login">log in</a> to post an answer.</span>
    </div>
  )

  return (
    <form className="comm-add-answer" onSubmit={handleSubmit}>
      <h4 className="comm-add-answer-title">Your Answer</h4>
      <textarea
        className="comm-textarea" rows={5}
        placeholder="Write a detailed, helpful answer..."
        value={content} onChange={e => setContent(e.target.value)}
      />
      <button type="submit" className="comm-btn-primary" disabled={loading}>
        {loading ? <><span className="comm-spinner" /> Posting...</> : <><FiSend /> Post Answer</>}
      </button>
    </form>
  )
}

// ─── Discussion Detail ────────────────────────────────────────────────────────
const DiscussionDetail = ({ discussion, onClose, onUpvote, onAddAnswer, onMarkSolved }) => {
  const { user } = useAuth()
  const [answerLoading, setAnswerLoading] = useState(false)

  const handleAddAnswer = async (content) => {
    setAnswerLoading(true)
    await onAddAnswer(discussion._id, content)
    setAnswerLoading(false)
  }

  const isOwner = user?._id === discussion.author?._id

  return (
    <div className="comm-detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="comm-detail-panel">
        <div className="comm-detail-header">
          <button className="comm-detail-close" onClick={onClose}><FiX /> Close</button>
          {isOwner && !discussion.solved && (
            <button className="comm-solve-btn" onClick={() => onMarkSolved(discussion._id)}>
              <FiCheckCircle /> Mark as Solved
            </button>
          )}
        </div>

        <div className="comm-detail-body">
          <div className="comm-detail-question">
            {discussion.solved && <div className="comm-solved-badge"><FiCheckCircle /> Solved</div>}
            <h2 className="comm-detail-title">{discussion.title}</h2>

            <div className="comm-detail-meta">
              <Avatar name={discussion.author?.name} size={40} />
              <div>
                <span className="comm-detail-author">{discussion.author?.name}</span>
                <span className="comm-detail-time">{timeAgo(discussion.createdAt)}</span>
              </div>
              {discussion.subject && <span className="comm-subject-badge">{discussion.subject}</span>}
              {discussion.exam && <span className="comm-exam-badge">{discussion.exam}</span>}
            </div>

            <div className="comm-detail-tags">
              {discussion.tags?.map(tag => <TagChip key={tag} tag={tag} />)}
            </div>

            <div className="comm-detail-content">
              {discussion.content?.split('\n').map((p, i) => p ? <p key={i}>{p}</p> : <br key={i} />)}
            </div>

            <div className="comm-detail-actions">
              <button className={`comm-vote-btn ${discussion.upvotedBy?.includes(user?._id) ? 'comm-voted' : ''}`} onClick={() => onUpvote(discussion._id)}>
                <FiThumbsUp /> {discussion.upvotes} Upvotes
              </button>
              <span className="comm-stat-pill"><FiEye /> {discussion.views} views</span>
              <span className="comm-stat-pill"><FiMessageSquare /> {discussion.answers?.length || 0} answers</span>
            </div>
          </div>

          <div className="comm-answers-section">
            <h3 className="comm-answers-heading">
              <FiMessageSquare /> {discussion.answers?.length || 0} Answers
            </h3>
            {discussion.answers?.length === 0 && (
              <div className="comm-no-answers">No answers yet. Be the first to help!</div>
            )}
            {discussion.answers?.map(ans => (
              <AnswerCard key={ans._id} answer={ans} isAccepted={ans.isAccepted} />
            ))}
          </div>

          <AddAnswerForm onSubmit={handleAddAnswer} loading={answerLoading} />
        </div>
      </div>
    </div>
  )
}

// ─── Discussion Card ──────────────────────────────────────────────────────────
const DiscussionCard = ({ discussion, onUpvote, onOpen, currentUserId }) => {
  const hasVoted = discussion.upvotedBy?.includes(currentUserId)

  return (
    <div className="comm-card" onClick={() => onOpen(discussion)}>
      <div className="comm-card-left">
        <button
          className={`comm-upvote-btn ${hasVoted ? 'comm-voted' : ''}`}
          onClick={(e) => { e.stopPropagation(); onUpvote(discussion._id) }}
          title="Upvote"
        >
          <FiThumbsUp size={16} />
          <span>{discussion.upvotes}</span>
        </button>
        <div className="comm-card-stats">
          <span className={`comm-stat ${discussion.solved ? 'comm-stat-solved' : ''}`}>
            <FiMessageSquare size={13} /> {discussion.answerCount}
          </span>
          <span className="comm-stat">
            <FiEye size={13} /> {discussion.views}
          </span>
        </div>
      </div>

      <div className="comm-card-main">
        <div className="comm-card-top-row">
          {discussion.solved && <span className="comm-solved-pill"><FiCheckCircle size={11} /> Solved</span>}
          {discussion.subject && <span className="comm-subject-pill">{discussion.subject}</span>}
          {discussion.exam && <span className="comm-exam-pill">{discussion.exam}</span>}
        </div>

        <h3 className="comm-card-title">{discussion.title}</h3>
        <p className="comm-card-excerpt">{discussion.content?.slice(0, 140)}...</p>

        <div className="comm-card-tags">
          {discussion.tags?.slice(0, 4).map(tag => <TagChip key={tag} tag={tag} />)}
        </div>

        <div className="comm-card-footer">
          <div className="comm-card-author">
            <Avatar name={discussion.author?.name} size={24} />
            <span>{discussion.author?.name}</span>
          </div>

          <div className="comm-card-mobile-stats">
            <button
              className={`comm-upvote-btn-sm ${hasVoted ? 'comm-voted' : ''}`}
              onClick={(e) => { e.stopPropagation(); onUpvote(discussion._id) }}
              title="Upvote"
            >
              <FiThumbsUp size={12} />
              <span>{discussion.upvotes}</span>
            </button>
            <span className="comm-card-time"><FiMessageSquare size={12} /> {discussion.answerCount}</span>
            <span className="comm-card-time"><FiEye size={12} /> {discussion.views}</span>
          </div>

          <span className="comm-card-time"><FiClock size={12} /> {timeAgo(discussion.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [discussions, setDiscussions] = useState(MOCK_DISCUSSIONS)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterExam, setFilterExam] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [page, setPage] = useState(1)
  const [showAskModal, setShowAskModal] = useState(false)
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const PER_PAGE = 5

  // Load discussions from API
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = { page, limit: PER_PAGE }
        if (search) params.q = search
        if (filterSubject) params.subject = filterSubject
        if (filterExam) params.exam = filterExam
        if (filterTag) params.tag = filterTag
        if (activeTab === 'unanswered') params.unanswered = true
        if (activeTab === 'mine' && isAuthenticated) params.mine = true

        const { data } = await api.get('/community/posts', { params })
        if (data?.posts?.length) setDiscussions(data.posts)
      } catch {
        // use mock data on error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, search, filterSubject, filterExam, filterTag, activeTab, isAuthenticated])

  const filtered = discussions.filter(d => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) &&
        !d.content.toLowerCase().includes(search.toLowerCase())) return false
    if (filterSubject && d.subject !== filterSubject) return false
    if (filterExam && d.exam !== filterExam) return false
    if (filterTag && !d.tags?.includes(filterTag)) return false
    if (activeTab === 'unanswered' && d.answerCount > 0) return false
    if (activeTab === 'mine' && d.author?._id !== user?._id) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleUpvote = async (id) => {
    if (!isAuthenticated) { toast.error('Please login to upvote'); return }
    try {
      await api.post(`/community/posts/${id}/like`)
    } catch { /* optimistic */ }
    setDiscussions(prev => prev.map(d =>
      d._id === id ? {
        ...d,
        upvotes: d.upvotedBy?.includes(user._id) ? d.upvotes - 1 : d.upvotes + 1,
        upvotedBy: d.upvotedBy?.includes(user._id)
          ? d.upvotedBy.filter(uid => uid !== user._id)
          : [...(d.upvotedBy || []), user._id],
      } : d
    ))
    if (selectedDiscussion?._id === id) {
      setSelectedDiscussion(prev => ({
        ...prev,
        upvotes: prev.upvotedBy?.includes(user._id) ? prev.upvotes - 1 : prev.upvotes + 1,
        upvotedBy: prev.upvotedBy?.includes(user._id)
          ? prev.upvotedBy.filter(uid => uid !== user._id)
          : [...(prev.upvotedBy || []), user._id],
      }))
    }
  }

  const handleAddAnswer = async (id, content) => {
    if (!isAuthenticated) { toast.error('Please login'); return }
    try {
      await api.post(`/community/posts/${id}/replies`, { content })
    } catch { /* optimistic */ }
    const newAnswer = {
      _id: Date.now().toString(), content,
      author: { name: user?.name, avatar: user?.avatar, _id: user?._id },
      upvotes: 0, createdAt: new Date().toISOString(), isAccepted: false,
    }
    setDiscussions(prev => prev.map(d =>
      d._id === id ? { ...d, answers: [...(d.answers || []), newAnswer], answerCount: (d.answerCount || 0) + 1 } : d
    ))
    setSelectedDiscussion(prev =>
      prev?._id === id ? { ...prev, answers: [...(prev.answers || []), newAnswer] } : prev
    )
    toast.success('Answer posted!')
  }

  const handleMarkSolved = async (id) => {
    try {
      await api.put(`/community/posts/${id}`, { solved: true })
    } catch { /* optimistic */ }
    setDiscussions(prev => prev.map(d => d._id === id ? { ...d, solved: true } : d))
    setSelectedDiscussion(prev => prev?._id === id ? { ...prev, solved: true } : prev)
    toast.success('Marked as solved!')
  }

  const handleAskSubmit = async (data) => {
    try {
      await api.post('/community/posts', data)
    } catch { /* optimistic */ }
    const newDiscussion = {
      _id: Date.now().toString(), ...data,
      author: { name: user?.name, avatar: user?.avatar, _id: user?._id },
      upvotes: 0, upvotedBy: [], answerCount: 0, views: 0,
      createdAt: new Date().toISOString(), solved: false, answers: [],
    }
    setDiscussions(prev => [newDiscussion, ...prev])
    toast.success('Question posted successfully!')
  }

  const handleTagClick = (tag) => {
    setFilterTag(tag === filterTag ? '' : tag)
    setPage(1)
  }

  return (
    <div className="comm-page">
      <Navbar />

      {/* Header */}
      <div className="comm-hero">
        <div className="comm-hero-content">
          <div className="comm-hero-icon"><FiMessageSquare /></div>
          <div>
            <h1 className="comm-hero-title">Community Forum</h1>
            <p className="comm-hero-sub">Ask questions, share knowledge, grow together</p>
          </div>
          <button className="comm-ask-btn" onClick={() => isAuthenticated ? setShowAskModal(true) : navigate('/login')}>
            <FiPlus /> Ask Question
          </button>
        </div>
        <div className="comm-hero-stats">
          <div className="comm-hero-stat"><span>{discussions.length}</span><label>Discussions</label></div>
          <div className="comm-hero-stat"><span>{discussions.filter(d => d.solved).length}</span><label>Solved</label></div>
          <div className="comm-hero-stat"><span>{discussions.reduce((a, d) => a + (d.answerCount || 0), 0)}</span><label>Answers</label></div>
        </div>
      </div>

      <div className="comm-layout">
        {/* Backdrop for Mobile Sidebar Drawer */}
        {showMobileFilters && (
          <div className="comm-sidebar-backdrop" onClick={() => setShowMobileFilters(false)} />
        )}

        {/* Left Sidebar */}
        <aside className={`comm-sidebar ${showMobileFilters ? 'comm-sidebar-open' : ''}`}>
          <div className="comm-sidebar-mobile-header">
            <h3>Filters</h3>
            <button className="comm-sidebar-mobile-close" onClick={() => setShowMobileFilters(false)}>
              <FiX size={20} />
            </button>
          </div>

          <div className="comm-sidebar-section">
            <h3 className="comm-sidebar-heading"><FiFilter size={14} /> Filter by Subject</h3>
            <div className="comm-filter-list">
              <button className={`comm-filter-btn ${filterSubject === '' ? 'active' : ''}`} onClick={() => { setFilterSubject(''); setPage(1); setShowMobileFilters(false); }}>All Subjects</button>
              {SUBJECTS.map(s => (
                <button key={s} className={`comm-filter-btn ${filterSubject === s ? 'active' : ''}`} onClick={() => { setFilterSubject(s === filterSubject ? '' : s); setPage(1); setShowMobileFilters(false); }}>{s}</button>
              ))}
            </div>
          </div>

          <div className="comm-sidebar-section">
            <h3 className="comm-sidebar-heading"><FiBookOpen size={14} /> Filter by Exam</h3>
            <div className="comm-filter-list">
              <button className={`comm-filter-btn ${filterExam === '' ? 'active' : ''}`} onClick={() => { setFilterExam(''); setPage(1); setShowMobileFilters(false); }}>All Exams</button>
              {EXAMS.slice(0, 6).map(e => (
                <button key={e} className={`comm-filter-btn ${filterExam === e ? 'active' : ''}`} onClick={() => { setFilterExam(e === filterExam ? '' : e); setPage(1); setShowMobileFilters(false); }}>{e}</button>
              ))}
            </div>
          </div>

          <div className="comm-sidebar-section">
            <h3 className="comm-sidebar-heading"><FiTrendingUp size={14} /> Popular Tags</h3>
            <div className="comm-popular-tags">
              {POPULAR_TAGS.map(tag => (
                <button key={tag} className={`comm-tag-chip comm-tag-lg ${filterTag === tag ? 'active' : ''}`} onClick={() => { handleTagClick(tag); setShowMobileFilters(false); }}>
                  <FiHash size={10} /> {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="comm-main">
          {/* Search & Tabs */}
          <div className="comm-controls">
            <div className="comm-search-wrap">
              <FiSearch className="comm-search-icon" />
              <input
                className="comm-search-input" type="text"
                placeholder="Search discussions..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
              {search && <button className="comm-search-clear" onClick={() => setSearch('')}><FiX /></button>}
            </div>
            
            <button className="comm-filter-toggle-btn" onClick={() => setShowMobileFilters(true)}>
              <FiFilter size={15} /> Filters {(filterSubject || filterExam || filterTag) ? '•' : ''}
            </button>

            <div className="comm-tabs">
              {[
                { id: 'all', label: 'All' },
                { id: 'unanswered', label: 'Unanswered' },
                { id: 'mine', label: 'My Questions' },
              ].map(tab => (
                <button key={tab.id} className={`comm-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); setPage(1) }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(filterSubject || filterExam || filterTag) && (
            <div className="comm-active-filters">
              <span>Filters:</span>
              {filterSubject && <span className="comm-filter-chip">{filterSubject} <button onClick={() => setFilterSubject('')}><FiX size={10} /></button></span>}
              {filterExam && <span className="comm-filter-chip">{filterExam} <button onClick={() => setFilterExam('')}><FiX size={10} /></button></span>}
              {filterTag && <span className="comm-filter-chip">#{filterTag} <button onClick={() => setFilterTag('')}><FiX size={10} /></button></span>}
              <button className="comm-clear-all" onClick={() => { setFilterSubject(''); setFilterExam(''); setFilterTag('') }}>Clear all</button>
            </div>
          )}

          {/* Results Count */}
          <div className="comm-results-info">
            {loading ? 'Loading...' : `${filtered.length} discussion${filtered.length !== 1 ? 's' : ''} found`}
          </div>

          {/* Discussion List */}
          {loading ? (
            <div className="comm-loading">
              {[1, 2, 3].map(i => <div key={i} className="comm-card-skeleton" />)}
            </div>
          ) : paged.length === 0 ? (
            <div className="comm-empty">
              <FiMessageSquare size={48} />
              <h3>No discussions found</h3>
              <p>Be the first to start a conversation!</p>
              <button className="comm-btn-primary" onClick={() => setShowAskModal(true)}><FiPlus /> Ask Question</button>
            </div>
          ) : (
            <div className="comm-list">
              {paged.map(d => (
                <DiscussionCard
                  key={d._id} discussion={d}
                  onUpvote={handleUpvote}
                  onOpen={setSelectedDiscussion}
                  currentUserId={user?._id}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="comm-pagination">
              <button className="comm-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`comm-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="comm-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </main>
      </div>

      {/* Ask Question Modal */}
      {showAskModal && <AskQuestionModal onClose={() => setShowAskModal(false)} onSubmit={handleAskSubmit} />}

      {/* Discussion Detail Panel */}
      {selectedDiscussion && (
        <DiscussionDetail
          discussion={selectedDiscussion}
          onClose={() => setSelectedDiscussion(null)}
          onUpvote={handleUpvote}
          onAddAnswer={handleAddAnswer}
          onMarkSolved={handleMarkSolved}
        />
      )}
    </div>
  )
}
