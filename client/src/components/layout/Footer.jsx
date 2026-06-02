import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiYoutube, FiLinkedin, FiHeart } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <div className="footer__logo-icon"><MdSchool size={20} /></div>
              <span className="footer__logo-text">Edu<span>Verse</span> AI</span>
            </Link>
            <p className="footer__tagline">
              Your AI-powered learning companion. One platform, all educators, infinite possibilities.
            </p>
            <div className="footer__socials">
              <a href="#" className="footer__social-link" aria-label="GitHub"><FiGithub size={18} /></a>
              <a href="#" className="footer__social-link" aria-label="Twitter"><FiTwitter size={18} /></a>
              <a href="#" className="footer__social-link" aria-label="YouTube"><FiYoutube size={18} /></a>
              <a href="#" className="footer__social-link" aria-label="LinkedIn"><FiLinkedin size={18} /></a>
            </div>
          </div>

          {/* Product */}
          <div className="footer__col">
            <h4 className="footer__col-title">Product</h4>
            <Link to="/search" className="footer__link">Search Videos</Link>
            <Link to="/roadmap" className="footer__link">Study Roadmap</Link>
            <Link to="/quiz" className="footer__link">AI Quizzes</Link>
            <Link to="/notes" className="footer__link">Notes Generator</Link>
            <Link to="/career" className="footer__link">Career Guidance</Link>
          </div>

          {/* Resources */}
          <div className="footer__col">
            <h4 className="footer__col-title">Resources</h4>
            <Link to="/community" className="footer__link">Community</Link>
            <Link to="/search?q=JEE" className="footer__link">JEE Preparation</Link>
            <Link to="/search?q=NEET" className="footer__link">NEET Preparation</Link>
            <Link to="/search?q=UPSC" className="footer__link">UPSC Preparation</Link>
            <a href="#" className="footer__link">Blog</a>
          </div>

          {/* Company */}
          <div className="footer__col">
            <h4 className="footer__col-title">Company</h4>
            <a href="#" className="footer__link">About Us</a>
            <a href="#" className="footer__link">Privacy Policy</a>
            <a href="#" className="footer__link">Terms of Service</a>
            <a href="#" className="footer__link">Contact</a>
            <a href="#" className="footer__link">Support</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} EduVerse AI. Made with <FiHeart size={14} className="footer__heart" /> for students everywhere.
          </p>
          <p className="footer__disclaimer">
            All video content is sourced from YouTube via API. We do not host any videos.
          </p>
        </div>
      </div>
    </footer>
  );
}
