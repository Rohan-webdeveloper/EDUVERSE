import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlay,
  FiBookmark,
  FiShare2,
  FiList,
  FiEye,
  FiTv,
  FiX,
  FiPlus,
} from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api, { playlistAPI } from '../../services/api';
import './VideoCard.css';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const formatViews = (count) => {
  if (!count && count !== 0) return '—';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
};

const getProviderClass = (provider = '') => {
  const p = provider.toLowerCase();
  if (p.includes('physics wallah') || p.includes('pw')) return 'pw';
  if (p.includes('khan')) return 'khan';
  if (p.includes('unacademy')) return 'unacademy';
  if (p.includes('vedantu')) return 'vedantu';
  if (p.includes('adda')) return 'adda247';
  if (p.includes('studyiq')) return 'studyiq';
  return 'default';
};

const getProviderLabel = (provider = '') => {
  const p = provider.toLowerCase();
  if (p.includes('physics wallah') || p.includes('pw')) return 'PW';
  if (p.includes('khan')) return 'Khan';
  if (p.includes('unacademy')) return 'Unacademy';
  if (p.includes('vedantu')) return 'Vedantu';
  if (p.includes('adda')) return 'Adda247';
  if (p.includes('studyiq')) return 'StudyIQ';
  return provider || 'YouTube';
};

const getDifficultyClass = (difficulty = '') => {
  const d = difficulty.toLowerCase();
  if (d === 'beginner') return 'beginner';
  if (d === 'advanced') return 'advanced';
  return 'intermediate';
};

/* ── Skeleton Card ───────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="video-card video-card--skeleton">
    <div className="video-card__thumbnail-wrap">
      <div className="video-card__skeleton-thumb skeleton-pulse" />
    </div>
    <div className="video-card__skeleton-body">
      <div className="video-card__skeleton-title-1 skeleton-pulse" />
      <div className="video-card__skeleton-title-2 skeleton-pulse" />
      <div className="video-card__skeleton-meta">
        <div className="video-card__skeleton-channel skeleton-pulse" />
        <div className="video-card__skeleton-badge skeleton-pulse" />
      </div>
      <div className="video-card__skeleton-views skeleton-pulse" />
    </div>
  </div>
);

/* ── Playlist Modal ───────────────────────────────────────────────────────── */
const PlaylistModal = ({ videoId, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Load playlists on mount
  useState(() => {
    playlistAPI
      .getAll()
      .then((res) => setPlaylists(res.data?.playlists || res.data || []))
      .catch(() => setPlaylists([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (playlistId) => {
    try {
      await playlistAPI.addVideo(playlistId, videoId);
      toast.success('Added to playlist!');
      onClose();
    } catch {
      toast.error('Failed to add to playlist.');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await playlistAPI.create({ name: newName.trim() });
      const created = res.data?.playlist || res.data;
      if (created?._id) await playlistAPI.addVideo(created._id, videoId);
      toast.success('Playlist created & video added!');
      onClose();
    } catch {
      toast.error('Failed to create playlist.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="playlist-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="playlist-modal">
        <div className="playlist-modal__header">
          <h3 className="playlist-modal__title">Add to Playlist</h3>
          <button className="playlist-modal__close" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="playlist-modal__list">
          {loading ? (
            <p className="playlist-modal__empty">Loading playlists…</p>
          ) : playlists.length === 0 ? (
            <p className="playlist-modal__empty">No playlists yet. Create one below!</p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl._id}
                className="playlist-modal__item"
                onClick={() => handleAdd(pl._id)}
              >
                <FiList size={16} />
                {pl.name}
              </button>
            ))
          )}
        </div>

        <div className="playlist-modal__create">
          <input
            className="playlist-modal__input"
            placeholder="New playlist name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            className="playlist-modal__create-btn"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
          >
            <FiPlus size={16} />
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main VideoCard Component ─────────────────────────────────────────────── */
const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [bookmarked, setBookmarked] = useState(video?.isBookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Skeleton mode
  if (!video) return <SkeletonCard />;

  const {
    id,
    videoId: ytId,
    title = 'Untitled Video',
    thumbnail,
    channelTitle = '',
    provider = '',
    duration = '',
    viewCount,
    difficulty = 'Intermediate',
  } = video;

  const videoIdentifier = ytId || id;
  const thumbSrc =
    thumbnail ||
    (videoIdentifier
      ? `https://img.youtube.com/vi/${videoIdentifier}/mqdefault.jpg`
      : 'https://via.placeholder.com/320x180/1e2130/64748b?text=Video');

  const handleCardClick = useCallback(
    (e) => {
      // Don't navigate if clicking action buttons
      if (e.target.closest('.video-card__actions')) return;
      navigate(
        `/video/${videoIdentifier}?title=${encodeURIComponent(title)}&channel=${encodeURIComponent(channelTitle)}`
      );
    },
    [navigate, videoIdentifier, title, channelTitle]
  );

  const handleBookmark = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        toast.error('Please login to bookmark videos');
        navigate('/login');
        return;
      }
      setBookmarkLoading(true);
      try {
        if (bookmarked) {
          await api.delete(`/bookmarks/${videoIdentifier}`);
          setBookmarked(false);
          toast.success('Bookmark removed');
        } else {
          await api.post('/bookmarks', { videoId: videoIdentifier, title, thumbnail: thumbSrc, channelTitle });
          setBookmarked(true);
          toast.success('Bookmarked! ✨');
        }
      } catch {
        toast.error('Failed to update bookmark');
      } finally {
        setBookmarkLoading(false);
      }
    },
    [isAuthenticated, bookmarked, videoIdentifier, title, thumbSrc, channelTitle, navigate]
  );

  const handleShare = useCallback(
    (e) => {
      e.stopPropagation();
      const url = `${window.location.origin}/video/${videoIdentifier}`;
      if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url).then(() => toast.success('Link copied! 🔗'));
      }
    },
    [videoIdentifier, title]
  );

  const handlePlaylist = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        toast.error('Please login to manage playlists');
        navigate('/login');
        return;
      }
      setShowPlaylistModal(true);
    },
    [isAuthenticated, navigate]
  );

  const providerKey = getProviderClass(provider);
  const providerLabel = getProviderLabel(provider);
  const difficultyKey = getDifficultyClass(difficulty);

  return (
    <>
      <div className="video-card" onClick={handleCardClick} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick(e)}>
        {/* Thumbnail */}
        <div className="video-card__thumbnail-wrap">
          <img
            src={thumbSrc}
            alt={title}
            className="video-card__thumbnail"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/320x180/1e2130/64748b?text=${encodeURIComponent(title.slice(0, 20))}`;
            }}
          />

          {/* Hover overlay with play button */}
          <div className="video-card__overlay">
            <div className="video-card__play-btn">
              <svg className="video-card__play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Provider badge */}
          <span className={`video-card__provider-badge video-card__provider-badge--${providerKey}`}>
            {providerLabel}
          </span>

          {/* Duration badge */}
          {duration && (
            <span className="video-card__duration">{duration}</span>
          )}
        </div>

        {/* Body */}
        <div className="video-card__body">
          <h3 className="video-card__title">{title}</h3>

          <div className="video-card__meta">
            <div className="video-card__channel">
              <FiTv size={12} className="video-card__channel-icon" />
              <span className="video-card__channel-name">{channelTitle || provider}</span>
            </div>
            {difficulty && (
              <span className={`video-card__difficulty video-card__difficulty--${difficultyKey}`}>
                {difficulty}
              </span>
            )}
          </div>

          <div className="video-card__stats">
            <span className="video-card__views">
              <FiEye size={12} />
              {formatViews(viewCount)}
            </span>
          </div>
        </div>

        {/* Action bar (appears on hover) */}
        <div className="video-card__actions">
          <button
            className={`video-card__action-btn ${bookmarked ? 'video-card__action-btn--bookmarked' : ''}`}
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked ? <BsBookmarkFill size={13} /> : <FiBookmark size={13} />}
            {bookmarked ? 'Saved' : 'Save'}
          </button>

          <button className="video-card__action-btn" onClick={handlePlaylist} title="Add to playlist">
            <FiList size={13} />
            Playlist
          </button>

          <div className="video-card__action-spacer" />

          <button className="video-card__action-btn" onClick={handleShare} title="Share">
            <FiShare2 size={13} />
            Share
          </button>
        </div>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <PlaylistModal
          videoId={videoIdentifier}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </>
  );
};

export default VideoCard;
