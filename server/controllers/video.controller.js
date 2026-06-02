const { searchEducationalVideos, getTrendingVideos } = require('../services/youtube.service');
const SearchHistory = require('../models/SearchHistory');
const Bookmark = require('../models/Bookmark');

// @desc    Search educational videos
// @route   GET /api/videos/search
exports.searchVideos = async (req, res) => {
  try {
    const { q, exam, subject, provider, duration, difficulty, pageToken } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    const result = await searchEducationalVideos({
      query: q,
      filters: { exam, subject, provider, duration, difficulty },
      pageToken: pageToken || '',
    });

    // Save search history if authenticated
    if (req.user) {
      await SearchHistory.create({
        userId: req.user.id,
        query: q,
        filters: { exam, subject, provider, duration, difficulty },
        resultCount: result.videos.length,
      }).catch(() => {});
    }

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending videos
// @route   GET /api/videos/trending
exports.getTrending = async (req, res) => {
  try {
    const videos = await getTrendingVideos('IN', 12);
    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bookmark a video
// @route   POST /api/videos/bookmark
exports.bookmarkVideo = async (req, res) => {
  try {
    const { videoId, videoTitle, thumbnail, channelTitle, duration, viewCount, subject, exam, difficulty, provider } = req.body;
    const existing = await Bookmark.findOne({ userId: req.user.id, videoId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    }
    await Bookmark.create({ userId: req.user.id, videoId, videoTitle, thumbnail, channelTitle, duration, viewCount, subject, exam, difficulty, provider });
    res.json({ success: true, bookmarked: true, message: 'Video bookmarked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user bookmarks
// @route   GET /api/videos/bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get search history
// @route   GET /api/videos/history
exports.getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear search history
// @route   DELETE /api/videos/history
exports.clearHistory = async (req, res) => {
  try {
    await SearchHistory.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
