const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { searchLimiter } = require('../middleware/rateLimiter');
const { sanitizeQuery } = require('../middleware/security');

router.get('/search', searchLimiter, sanitizeQuery, optionalAuth, videoController.searchVideos);
router.get('/trending', videoController.getTrending);
router.post('/bookmark', protect, videoController.bookmarkVideo);
router.get('/bookmarks', protect, videoController.getBookmarks);
router.get('/history', protect, videoController.getSearchHistory);
router.delete('/history', protect, videoController.clearHistory);

module.exports = router;
