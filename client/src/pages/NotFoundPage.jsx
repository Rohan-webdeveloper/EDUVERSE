import { Link } from 'react-router-dom';
import '../styles/index.css';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>📚</div>
      <h1 style={{ fontSize: '4rem', fontWeight: '900', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
        Looks like this lesson hasn't been uploaded yet. Let's get you back to learning!
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
        <Link to="/search" className="btn btn-secondary btn-lg">Search Videos</Link>
      </div>
    </div>
  );
}
