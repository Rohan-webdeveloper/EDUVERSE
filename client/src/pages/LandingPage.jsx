import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronDown, FiChevronUp, FiArrowRight, FiPlay, FiStar, FiCheck } from 'react-icons/fi';
import {
  MdSchool, MdBolt, MdRocketLaunch, MdAutoAwesome,
  MdBarChart, MdWorkspacePremium, MdMap, MdQuiz,
  MdNoteAdd, MdSupportAgent
} from 'react-icons/md';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './LandingPage.css';

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const POPULAR_SEARCHES = [
  'Electrostatics', 'Integration', 'French Revolution',
  'Organic Chemistry', 'JEE 2025', 'NEET Biology',
  'Thermodynamics', 'Trigonometry',
];

const STATS = [
  { value: '1M+', label: 'Videos', icon: '🎬' },
  { value: '50+', label: 'Channels', icon: '📺' },
  { value: '10+', label: 'Exams', icon: '📋' },
  { value: '500K+', label: 'Students', icon: '🎓' },
];

const EXAM_BADGES = [
  { label: 'JEE', color: '#2563eb' },
  { label: 'NEET', color: '#7c3aed' },
  { label: 'UPSC', color: '#0891b2' },
  { label: 'SSC', color: '#d97706' },
  { label: 'GATE', color: '#059669' },
  { label: 'CAT', color: '#dc2626' },
  { label: 'CUET', color: '#7c3aed' },
  { label: 'Class 10/12', color: '#2563eb' },
];

const EDUCATORS_MARQUEE = [
  'Physics Wallah', 'Khan Academy', 'Unacademy', 'Vedantu',
  'Adda247', 'StudyIQ', 'Apni Kaksha', 'Maths by Neha',
  'Chemistry by Arvind Arora', 'Biology by Seep Pahuja',
  'Amit Mahajan Math', 'Byju\'s', 'ALLEN', 'Resonance',
  'IIT JEE Wallah', 'Concepts with Satendra Singh',
];

const CATEGORIES = [
  { emoji: '⚡', name: 'Physics', videos: '45,200+', gradient: 'linear-gradient(135deg,#2563eb,#06b6d4)' },
  { emoji: '🧪', name: 'Chemistry', videos: '38,700+', gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
  { emoji: '🧬', name: 'Biology', videos: '32,100+', gradient: 'linear-gradient(135deg,#059669,#10b981)' },
  { emoji: '📐', name: 'Mathematics', videos: '56,400+', gradient: 'linear-gradient(135deg,#d97706,#f59e0b)' },
  { emoji: '🏛️', name: 'History', videos: '18,900+', gradient: 'linear-gradient(135deg,#dc2626,#f87171)' },
  { emoji: '🌍', name: 'Geography', videos: '14,300+', gradient: 'linear-gradient(135deg,#0891b2,#22d3ee)' },
  { emoji: '💻', name: 'Computer Science', videos: '29,600+', gradient: 'linear-gradient(135deg,#1d4ed8,#60a5fa)' },
  { emoji: '📈', name: 'Economics', videos: '16,800+', gradient: 'linear-gradient(135deg,#b45309,#fbbf24)' },
  { emoji: '📚', name: 'English', videos: '22,500+', gradient: 'linear-gradient(135deg,#6d28d9,#8b5cf6)' },
];

const EDUCATORS = [
  {
    name: 'Alakh Pandey',
    channel: 'Physics Wallah',
    subject: 'Physics & Chemistry',
    subs: '10.2M',
    color: 'linear-gradient(135deg,#ff6b35,#f7c59f)',
    initials: 'AP',
  },
  {
    name: 'Sal Khan',
    channel: 'Khan Academy',
    subject: 'Multi-Subject',
    subs: '8.9M',
    color: 'linear-gradient(135deg,#2563eb,#60a5fa)',
    initials: 'SK',
  },
  {
    name: 'Gaurav Gupta',
    channel: 'Unacademy',
    subject: 'JEE Mathematics',
    subs: '3.4M',
    color: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    initials: 'GG',
  },
  {
    name: 'Vedantu Team',
    channel: 'Vedantu',
    subject: 'All Subjects',
    subs: '6.7M',
    color: 'linear-gradient(135deg,#059669,#34d399)',
    initials: 'VT',
  },
  {
    name: 'Vikas Divyakirti',
    channel: 'Drishti IAS',
    subject: 'UPSC Preparation',
    subs: '5.1M',
    color: 'linear-gradient(135deg,#0891b2,#38bdf8)',
    initials: 'VD',
  },
  {
    name: 'Kumar Gaurav',
    channel: 'StudyIQ',
    subject: 'Government Exams',
    subs: '4.3M',
    color: 'linear-gradient(135deg,#d97706,#fcd34d)',
    initials: 'KG',
  },
  {
    name: 'Arvind Arora',
    channel: 'A2 Motivation',
    subject: 'Chemistry',
    subs: '2.8M',
    color: 'linear-gradient(135deg,#dc2626,#fca5a5)',
    initials: 'AA',
  },
];

const AI_FEATURES = [
  {
    icon: <MdSupportAgent size={32} />,
    title: 'AI Doubt Solver',
    description: 'Get instant answers to any doubt from our GPT-4 powered AI tutor. Works 24/7, explains step-by-step.',
    gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)',
    glow: 'rgba(37,99,235,0.35)',
  },
  {
    icon: <MdNoteAdd size={32} />,
    title: 'Smart Notes Generator',
    description: 'Auto-generate structured notes from any video lecture. Export as PDF, share, or annotate.',
    gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    glow: 'rgba(124,58,237,0.35)',
  },
  {
    icon: <MdMap size={32} />,
    title: 'Study Roadmap',
    description: 'Personalized week-by-week learning plan based on your exam date, current level, and weak topics.',
    gradient: 'linear-gradient(135deg,#0891b2,#2563eb)',
    glow: 'rgba(8,145,178,0.35)',
  },
  {
    icon: <MdQuiz size={32} />,
    title: 'AI Quiz Generator',
    description: 'Practice with adaptive MCQs generated from your studied videos. Tracks accuracy and weak zones.',
    gradient: 'linear-gradient(135deg,#059669,#0891b2)',
    glow: 'rgba(5,150,105,0.35)',
  },
  {
    icon: <MdBarChart size={32} />,
    title: 'Progress Tracker',
    description: 'Visual dashboards showing your daily streak, topic completion, test scores, and improvement curves.',
    gradient: 'linear-gradient(135deg,#d97706,#dc2626)',
    glow: 'rgba(217,119,6,0.35)',
  },
  {
    icon: <MdWorkspacePremium size={32} />,
    title: 'Career Guidance',
    description: 'AI-powered career counselling – from stream selection to college shortlisting and interview prep.',
    gradient: 'linear-gradient(135deg,#7c3aed,#2563eb)',
    glow: 'rgba(124,58,237,0.35)',
  },
];

const ROADMAP_PHASES = [
  { phase: 'Week 1–2', label: 'Foundation', topics: ['Basic Concepts', 'Formula Sheets', 'Conceptual Videos'], color: '#2563eb' },
  { phase: 'Week 3–4', label: 'Core Building', topics: ['Chapter-wise Practice', 'AI Doubt Sessions', 'Weekly Quiz'], color: '#7c3aed' },
  { phase: 'Week 5–8', label: 'Deep Dive', topics: ['Advanced Topics', 'PYQ Analysis', 'Mock Tests'], color: '#0891b2' },
  { phase: 'Week 9–12', label: 'Revision & Mastery', topics: ['Rapid Revision', 'Full Mock Tests', 'Weak Area Focus'], color: '#059669' },
  { phase: 'Final Week', label: 'Exam Ready', topics: ['Last-Minute Notes', 'Confidence Boosters', 'AI Predictions'], color: '#d97706' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    exam: 'JEE Advanced 2024',
    rank: 'AIR 247',
    quote: 'EduVerse AI completely changed how I studied. The AI Doubt Solver saved me hours every day. I could instantly resolve doubts at 2 AM before the exam. The study roadmap kept me on track for 3 months straight.',
    avatar: 'PS',
    color: 'linear-gradient(135deg,#2563eb,#7c3aed)',
    stars: 5,
  },
  {
    name: 'Rahul Verma',
    exam: 'NEET 2024',
    rank: 'Score: 720/720',
    quote: 'I was struggling to find quality biology videos until I discovered EduVerse. Having PW, Vedantu, and Khan Academy all in one place with AI notes generation was a complete game changer. Highest possible score!',
    avatar: 'RV',
    color: 'linear-gradient(135deg,#059669,#0891b2)',
    stars: 5,
  },
  {
    name: 'Amit Kumar Singh',
    exam: 'UPSC CSE 2024',
    rank: 'Rank 89',
    quote: 'The StudyIQ and Drishti IAS content aggregated together with AI-generated structured notes made revision 3x faster. The personalized roadmap helped me allocate time across 20+ subjects strategically.',
    avatar: 'AK',
    color: 'linear-gradient(135deg,#d97706,#dc2626)',
    stars: 5,
  },
];

const FAQS = [
  { q: 'Is EduVerse AI completely free to use?', a: 'EduVerse AI offers a generous free tier with access to 10,000+ videos, basic AI doubt solving, and limited notes generation. Our Premium plan (₹299/month) unlocks unlimited AI features, personalized roadmaps, advanced analytics, and ad-free viewing across all 1M+ videos.' },
  { q: 'Which exams does EduVerse AI support?', a: 'We currently support JEE (Main & Advanced), NEET UG & PG, UPSC Civil Services, SSC CGL/CHSL/MTS, GATE, CAT/MBA exams, CUET, and all State Board exams (Class 9-12). We\'re continuously adding more exams based on student demand.' },
  { q: 'How does the AI Doubt Solver work?', a: 'Our AI Doubt Solver is powered by GPT-4 with specialized fine-tuning on 10+ years of competitive exam questions. You can type, speak, or upload an image of your doubt. The AI provides step-by-step explanations, alternative approaches, and related practice questions.' },
  { q: 'Can I download videos for offline watching?', a: 'Video downloads are available for Premium subscribers on our mobile apps (iOS & Android). Downloaded content is available for 30 days and auto-refreshes if your subscription is active. This feature complies with all educator content agreements.' },
  { q: 'How is EduVerse AI different from YouTube or individual platforms?', a: 'EduVerse AI combines the best content from 50+ channels into one unified platform, eliminating the need to switch between apps. Our proprietary AI layer adds features like doubt solving, notes generation, and personalized roadmaps that no single platform offers. We also provide curated playlists, cross-channel topic coverage, and a community of 500K+ serious students.' },
  { q: 'Is the content from licensed educators?', a: 'Yes, all content on EduVerse AI is either licensed directly from educators, aggregated from their public YouTube channels with proper attribution and deep-linking, or created by our in-house expert team. We strictly respect creator copyrights and revenue models.' },
  { q: 'How accurate is the AI-generated study roadmap?', a: 'Our roadmaps are generated using a combination of exam syllabus data, past year paper analysis, and your individual performance metrics. They are reviewed by top educators and continuously updated based on student outcomes. Students following our roadmaps have shown 40% better score improvements in mock tests.' },
  { q: 'Can I collaborate with other students on EduVerse AI?', a: 'Absolutely! Our Community features include subject-wise study groups, doubt discussion forums, peer-to-peer learning rooms, and leaderboards. You can form study groups with up to 10 friends, share notes, and conduct group quiz sessions.' },
];

const EXAM_SUBJECTS = [
  'All Exams', 'JEE Main', 'JEE Advanced', 'NEET', 'UPSC', 'SSC CGL', 'GATE', 'CAT', 'CUET', 'Class 12', 'Class 10',
];

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState('All Exams');
  const [openFaq, setOpenFaq] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const educatorsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim() || selectedExam;
    if (q && q !== 'All Exams') {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handlePillSearch = (pill) => {
    navigate(`/search?q=${encodeURIComponent(pill)}`);
  };

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  const scrollEducators = (dir) => {
    if (educatorsRef.current) {
      educatorsRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="landing">
      <Navbar />

      {/* ──────────────────────────── SECTION 1: HERO ──────────────────────────── */}
      <section className="hero-section">
        {/* Animated gradient mesh */}
        <div className="hero-mesh" aria-hidden="true">
          <div className="hero-mesh__blob hero-mesh__blob--1" />
          <div className="hero-mesh__blob hero-mesh__blob--2" />
          <div className="hero-mesh__blob hero-mesh__blob--3" />
          <div className="hero-mesh__blob hero-mesh__blob--4" />
        </div>

        {/* Floating geometric shapes */}
        <div className="hero-shapes" aria-hidden="true">
          <div className="shape shape--circle shape--1" />
          <div className="shape shape--circle shape--2" />
          <div className="shape shape--ring shape--3" />
          <div className="shape shape--ring shape--4" />
          <div className="shape shape--dot shape--5" />
          <div className="shape shape--dot shape--6" />
          <div className="shape shape--square shape--7" />
          <div className="shape shape--square shape--8" />
        </div>

        {/* Floating video thumbnail cards */}
        <div className="hero-float-cards" aria-hidden="true">
          <div className="float-card float-card--1">
            <div className="float-card__thumb" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
              <FiPlay size={20} color="#fff" />
            </div>
            <div className="float-card__info">
              <span className="float-card__title">Electrostatics Ch.1</span>
              <span className="float-card__sub">Physics Wallah</span>
            </div>
          </div>
          <div className="float-card float-card--2">
            <div className="float-card__thumb" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <FiPlay size={20} color="#fff" />
            </div>
            <div className="float-card__info">
              <span className="float-card__title">Integration Basics</span>
              <span className="float-card__sub">Khan Academy</span>
            </div>
          </div>
          <div className="float-card float-card--3">
            <div className="float-card__thumb" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
              <FiPlay size={20} color="#fff" />
            </div>
            <div className="float-card__info">
              <span className="float-card__title">Organic Chemistry</span>
              <span className="float-card__sub">Vedantu</span>
            </div>
          </div>
          <div className="float-card float-card--4">
            <div className="float-card__thumb" style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
              <FiPlay size={20} color="#fff" />
            </div>
            <div className="float-card__info">
              <span className="float-card__title">Cell Biology</span>
              <span className="float-card__sub">Unacademy</span>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="hero-content">
          <div className="hero-badge">
            <MdBolt size={16} color="#f59e0b" />
            <span>AI-Powered Learning Platform for India's Top Exams</span>
          </div>

          <h1 className="hero-headline">
            Learn Smarter with AI.<br />
            <span className="gradient-text">One Platform, All Educators.</span>
          </h1>

          <p className="hero-subheading">
            Access the best content from <strong>Physics Wallah</strong>, <strong>Unacademy</strong>,{' '}
            <strong>Vedantu</strong>, <strong>Khan Academy</strong>, <strong>StudyIQ</strong> &amp; 45+ more channels —
            all under one AI-powered roof. Your exam success starts here.
          </p>

          {/* Search bar */}
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search__dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="hero-search__dropdown-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{selectedExam}</span>
                <FiChevronDown size={16} />
              </button>
              {isDropdownOpen && (
                <div className="hero-search__dropdown-menu">
                  {EXAM_SUBJECTS.map((exam) => (
                    <button
                      key={exam}
                      type="button"
                      className={`hero-search__dropdown-item ${selectedExam === exam ? 'active' : ''}`}
                      onClick={() => { setSelectedExam(exam); setIsDropdownOpen(false); }}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hero-search__divider" />
            <FiSearch className="hero-search__icon" size={20} />
            <input
              type="text"
              className="hero-search__input"
              placeholder="Search topics, chapters, concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hero-search__btn">
              Search <FiArrowRight size={16} />
            </button>
          </form>

          {/* Popular search pills */}
          <div className="hero-pills">
            <span className="hero-pills__label">Popular:</span>
            {POPULAR_SEARCHES.map((pill) => (
              <button
                key={pill}
                className="hero-pill"
                onClick={() => handlePillSearch(pill)}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat__icon">{s.icon}</span>
                <span className="hero-stat__value">{s.value}</span>
                <span className="hero-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── SECTION 2: TRUSTED BY ─────────────────────── */}
      <section className="trusted-section">
        <div className="container">
          <p className="trusted-label">Trusted by students preparing for</p>
          <div className="trusted-badges">
            {EXAM_BADGES.map((b) => (
              <div
                key={b.label}
                className="trusted-badge"
                style={{ '--badge-color': b.color }}
              >
                {b.label}
              </div>
            ))}
          </div>

          <div className="trusted-marquee-wrapper">
            <div className="trusted-marquee">
              {[...EDUCATORS_MARQUEE, ...EDUCATORS_MARQUEE].map((name, i) => (
                <span key={i} className="trusted-marquee__item">
                  <MdSchool size={14} />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── SECTION 3: POPULAR CATEGORIES ──────────────────── */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Browse by Subject</p>
            <h2 className="section-title">
              Explore <span className="gradient-text">Popular Categories</span>
            </h2>
            <p className="section-subtitle">
              Comprehensive video libraries across all major subjects, curated from India's best educators.
            </p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
              >
                <div
                  className="category-card__icon-wrap"
                  style={{ background: cat.gradient }}
                >
                  <span className="category-card__emoji">{cat.emoji}</span>
                </div>
                <div className="category-card__body">
                  <h3 className="category-card__name">{cat.name}</h3>
                  <p className="category-card__count">{cat.videos} videos</p>
                </div>
                <FiArrowRight className="category-card__arrow" size={16} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── SECTION 4: TOP EDUCATORS ─────────────────────── */}
      <section className="educators-section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Learn from the Best</p>
            <h2 className="section-title">
              India's <span className="gradient-text">Top Educators</span>
            </h2>
            <p className="section-subtitle">
              Handpicked educators with proven track records of producing toppers year after year.
            </p>
          </div>

          <div className="educators-row-wrapper">
            <button
              className="educators-scroll-btn educators-scroll-btn--left"
              onClick={() => scrollEducators(-1)}
              aria-label="Scroll left"
            >
              ‹
            </button>
            <div className="educators-row" ref={educatorsRef}>
              {EDUCATORS.map((ed) => (
                <div key={ed.name} className="educator-card">
                  <div className="educator-card__avatar" style={{ background: ed.color }}>
                    <span>{ed.initials}</span>
                  </div>
                  <div className="educator-card__badge">
                    <MdRocketLaunch size={10} /> Top Educator
                  </div>
                  <h4 className="educator-card__name">{ed.name}</h4>
                  <p className="educator-card__channel">{ed.channel}</p>
                  <p className="educator-card__subject">{ed.subject}</p>
                  <div className="educator-card__subs">
                    <span>{ed.subs} subscribers</span>
                  </div>
                  <button
                    className="educator-card__btn"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(ed.channel)}`)}
                  >
                    View Courses
                  </button>
                </div>
              ))}
            </div>
            <button
              className="educators-scroll-btn educators-scroll-btn--right"
              onClick={() => scrollEducators(1)}
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────── SECTION 5: AI FEATURES ──────────────────────── */}
      <section className="ai-section">
        {/* Glass noise overlay */}
        <div className="ai-section__bg" aria-hidden="true">
          <div className="ai-bg-blob ai-bg-blob--1" />
          <div className="ai-bg-blob ai-bg-blob--2" />
          <div className="ai-bg-blob ai-bg-blob--3" />
        </div>
        <div className="container">
          <div className="section-header section-header--light">
            <div className="ai-badge">
              <MdAutoAwesome size={14} />
              <span>Powered by GPT-4 & Gemini</span>
            </div>
            <h2 className="section-title section-title--light">
              Supercharge Learning with <span className="gradient-text-bright">AI Features</span>
            </h2>
            <p className="section-subtitle section-subtitle--light">
              Our AI doesn't just answer questions — it understands your learning style, tracks your progress,
              and adapts to help you achieve your best score.
            </p>
          </div>

          <div className="ai-features-grid">
            {AI_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="ai-feature-card"
                style={{ '--glow': feat.glow }}
              >
                <div className="ai-feature-card__icon" style={{ background: feat.gradient }}>
                  {feat.icon}
                </div>
                <h3 className="ai-feature-card__title">{feat.title}</h3>
                <p className="ai-feature-card__desc">{feat.description}</p>
                <div className="ai-feature-card__link">
                  Learn more <FiArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── SECTION 6: LEARNING ROADMAP PREVIEW ─────────────── */}
      <section className="roadmap-section">
        <div className="container">
          <div className="roadmap-split">
            {/* Left text */}
            <div className="roadmap-left">
              <p className="section-label">AI Personalization</p>
              <h2 className="section-title">
                Your Personalized<br />
                <span className="gradient-text">Learning Journey</span>
              </h2>
              <p className="roadmap-desc">
                Stop guessing what to study next. Our AI builds a custom week-by-week plan
                based on your exam date, current knowledge level, strong and weak topics,
                and daily available study time.
              </p>
              <ul className="roadmap-benefits">
                <li><FiCheck className="check-icon" /> Adapts in real-time to your progress</li>
                <li><FiCheck className="check-icon" /> Integrates with your video watch history</li>
                <li><FiCheck className="check-icon" /> Sends daily study reminders</li>
                <li><FiCheck className="check-icon" /> Covers all topics before your exam day</li>
              </ul>
              <button
                className="btn-primary-large"
                onClick={() => navigate('/register')}
              >
                Get My Free Roadmap <FiArrowRight size={18} />
              </button>
            </div>

            {/* Right roadmap visual */}
            <div className="roadmap-right">
              <div className="roadmap-timeline">
                {ROADMAP_PHASES.map((phase, i) => (
                  <div key={i} className="roadmap-step">
                    <div className="roadmap-step__line">
                      <div
                        className="roadmap-step__dot"
                        style={{ background: phase.color, boxShadow: `0 0 12px ${phase.color}66` }}
                      />
                      {i < ROADMAP_PHASES.length - 1 && (
                        <div className="roadmap-step__connector" style={{ background: `linear-gradient(180deg, ${phase.color}, ${ROADMAP_PHASES[i + 1].color})` }} />
                      )}
                    </div>
                    <div className="roadmap-step__content">
                      <div className="roadmap-step__header">
                        <span
                          className="roadmap-step__phase"
                          style={{ color: phase.color, borderColor: `${phase.color}44`, background: `${phase.color}11` }}
                        >
                          {phase.phase}
                        </span>
                        <span className="roadmap-step__label">{phase.label}</span>
                      </div>
                      <div className="roadmap-step__topics">
                        {phase.topics.map((t) => (
                          <span key={t} className="roadmap-topic-chip">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── SECTION 7: TESTIMONIALS ──────────────────────── */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Student Success Stories</p>
            <h2 className="section-title">
              Real Students, <span className="gradient-text">Real Results</span>
            </h2>
            <p className="section-subtitle">
              Join 500,000+ students who achieved their dream scores using EduVerse AI.
            </p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-card__stars">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <FiStar key={i} className="star-icon" />
                  ))}
                </div>
                <p className="testimonial-card__quote">"{t.quote}"</p>
                <div className="testimonial-card__footer">
                  <div className="testimonial-card__avatar" style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="testimonial-card__name">{t.name}</p>
                    <p className="testimonial-card__meta">
                      {t.exam} · <strong>{t.rank}</strong>
                    </p>
                  </div>
                </div>
                <div className="testimonial-card__accent" style={{ background: t.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SECTION 8: FAQ ───────────────────────────── */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Got Questions?</p>
            <h2 className="section-title">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${openFaq === i ? 'faq-item--open' : ''}`}
              >
                <button
                  className="faq-item__question"
                  onClick={() => toggleFaq(i)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-item__icon">
                    {openFaq === i ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  </span>
                </button>
                <div className="faq-item__answer">
                  <div className="faq-item__answer-inner">
                    <p>{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-cta">
            <p>Still have questions? We're here to help.</p>
            <Link to="/contact" className="faq-cta__link">
              Contact Support <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── CTA BANNER ──────────────── */}
      <section className="cta-banner-section">
        <div className="cta-banner__bg" aria-hidden="true">
          <div className="cta-blob cta-blob--1" />
          <div className="cta-blob cta-blob--2" />
        </div>
        <div className="container">
          <div className="cta-banner-content">
            <MdAutoAwesome size={48} className="cta-banner__icon" />
            <h2 className="cta-banner__title">
              Ready to unlock your full potential?
            </h2>
            <p className="cta-banner__sub">
              Join 500,000+ students. Start for free — no credit card required.
            </p>
            <div className="cta-banner__btns">
              <button
                className="btn-primary-large"
                onClick={() => navigate('/register')}
              >
                Start Learning Free <FiArrowRight size={18} />
              </button>
              <button
                className="btn-ghost-large"
                onClick={() => navigate('/search')}
              >
                <FiPlay size={16} /> Browse Content
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: FOOTER */}
      <Footer />
    </div>
  );
}
