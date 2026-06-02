const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', playlistController.getPlaylists);
router.post('/', playlistController.createPlaylist);
router.get('/:id', playlistController.getPlaylist);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);
router.post('/:id/videos', playlistController.addVideo);
router.delete('/:id/videos/:videoId', playlistController.removeVideo);

module.exports = router;
