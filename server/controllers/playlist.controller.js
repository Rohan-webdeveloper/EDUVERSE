const Playlist = require('../models/Playlist');

// @desc    Get all playlists
// @route   GET /api/playlists
exports.getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create playlist
// @route   POST /api/playlists
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, exam, subject, tags } = req.body;
    const playlist = await Playlist.create({ userId: req.user.id, name, description, isPublic, exam, subject, tags });
    res.status(201).json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single playlist
// @route   GET /api/playlists/:id
exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
exports.updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add video to playlist
// @route   POST /api/playlists/:id/videos
exports.addVideo = async (req, res) => {
  try {
    const { videoId, title, thumbnail, channelTitle, duration } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

    const alreadyAdded = playlist.videos.some(v => v.videoId === videoId);
    if (alreadyAdded) return res.status(400).json({ success: false, message: 'Video already in playlist' });

    playlist.videos.push({ videoId, title, thumbnail, channelTitle, duration });
    await playlist.save();
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove video from playlist
// @route   DELETE /api/playlists/:id/videos/:videoId
exports.removeVideo = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

    playlist.videos = playlist.videos.filter(v => v.videoId !== req.params.videoId);
    await playlist.save();
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
