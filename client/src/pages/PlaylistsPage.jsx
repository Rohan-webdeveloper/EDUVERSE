import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit3, FiPlay, FiX, FiMusic } from 'react-icons/fi';
import './PlaylistsPage.css';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => { fetchPlaylists(); }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await api.get('/playlists');
      setPlaylists(res.data.playlists);
    } catch (err) { toast.error('Failed to load playlists'); }
    finally { setLoading(false); }
  };

  const createPlaylist = async () => {
    if (!newName.trim()) return toast.error('Enter a name');
    try {
      await api.post('/playlists', { name: newName, description: newDesc });
      await fetchPlaylists();
      setShowCreate(false); setNewName(''); setNewDesc('');
      toast.success('Playlist created!');
    } catch (err) { toast.error('Failed'); }
  };

  const deletePlaylist = async (id) => {
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists(prev => prev.filter(p => p._id !== id));
      if (selectedPlaylist?._id === id) setSelectedPlaylist(null);
      toast.success('Playlist deleted');
    } catch (err) { toast.error('Failed'); }
  };

  const removeVideo = async (playlistId, videoId) => {
    try {
      await api.delete(`/playlists/${playlistId}/videos/${videoId}`);
      const res = await api.get(`/playlists/${playlistId}`);
      setSelectedPlaylist(res.data.playlist);
      fetchPlaylists();
      toast.success('Video removed');
    } catch (err) { toast.error('Failed'); }
  };

  const viewPlaylist = async (playlist) => {
    try {
      const res = await api.get(`/playlists/${playlist._id}`);
      setSelectedPlaylist(res.data.playlist);
    } catch (err) { toast.error('Failed to load'); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="playlists-page container">
        <div className="playlists-page__header">
          <h1>📚 My Playlists</h1>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><FiPlus /> Create Playlist</button>
        </div>

        {showCreate && (
          <div className="playlists-page__create card animate-slide-up">
            <h3>New Playlist</h3>
            <input className="form-input" placeholder="Playlist name..." value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="form-input" placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{marginTop:'0.5rem'}} />
            <div className="playlists-page__create-actions">
              <button className="btn btn-primary" onClick={createPlaylist}>Create</button>
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        )}

        {selectedPlaylist ? (
          <div className="playlists-page__detail animate-fade-in">
            <button className="btn btn-ghost" onClick={() => setSelectedPlaylist(null)}>← Back to Playlists</button>
            <div className="playlists-page__detail-header">
              <h2>{selectedPlaylist.name}</h2>
              <p className="text-secondary">{selectedPlaylist.description || `${selectedPlaylist.totalVideos} videos`}</p>
            </div>
            {selectedPlaylist.videos?.length > 0 ? (
              <div className="playlists-page__video-list">
                {selectedPlaylist.videos.map((v, i) => (
                  <div key={v.videoId} className="playlists-page__video-item card">
                    <span className="playlists-page__video-num">{i + 1}</span>
                    <img src={v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} alt="" className="playlists-page__video-thumb" />
                    <div className="playlists-page__video-info">
                      <h4>{v.title || 'Video'}</h4>
                      <p>{v.channelTitle || ''} {v.duration && `• ${v.duration}`}</p>
                    </div>
                    <a href={`/video/${v.videoId}?title=${encodeURIComponent(v.title || '')}&channel=${encodeURIComponent(v.channelTitle || '')}`} className="btn btn-primary btn-sm"><FiPlay size={14} /></a>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeVideo(selectedPlaylist._id, v.videoId)}><FiTrash2 size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state__icon">📂</div><p className="empty-state__text">No videos yet. Add from the video player!</p></div>
            )}
          </div>
        ) : (
          <div className="playlists-page__grid">
            {loading ? (
              [...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{height:200, borderRadius:16}} />)
            ) : playlists.length > 0 ? (
              playlists.map(p => (
                <div key={p._id} className="playlists-page__card card card-hover" onClick={() => viewPlaylist(p)}>
                  <div className="playlists-page__card-thumb">
                    <FiMusic size={32} />
                    <span className="playlists-page__card-count">{p.totalVideos} videos</span>
                  </div>
                  <h3 className="playlists-page__card-name">{p.name}</h3>
                  <p className="playlists-page__card-desc">{p.description || 'No description'}</p>
                  <div className="playlists-page__card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); deletePlaylist(p._id); }}><FiTrash2 size={14} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{gridColumn:'1/-1'}}>
                <div className="empty-state__icon">📚</div>
                <h3 className="empty-state__title">No playlists yet</h3>
                <p className="empty-state__text">Create your first playlist to organize videos</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
