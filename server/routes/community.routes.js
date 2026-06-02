const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', communityController.getDiscussions);
router.get('/:id', communityController.getDiscussion);
router.post('/', protect, communityController.createDiscussion);
router.post('/:id/answers', protect, communityController.addAnswer);
router.put('/:id/upvote', protect, communityController.upvoteDiscussion);

module.exports = router;
