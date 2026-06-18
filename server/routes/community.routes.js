const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/posts', communityController.getDiscussions);
router.get('/posts/:id', communityController.getDiscussion);
router.post('/posts', protect, communityController.createDiscussion);
router.put('/posts/:id', protect, communityController.updateDiscussion);
router.delete('/posts/:id', protect, communityController.deleteDiscussion);
router.post('/posts/:id/replies', protect, communityController.addAnswer);
router.post('/posts/:id/like', protect, communityController.upvoteDiscussion);

module.exports = router;
