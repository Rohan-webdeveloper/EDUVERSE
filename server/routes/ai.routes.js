const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { sanitizeAIInput } = require('../middleware/security');

// All AI routes: rate limited + auth required + input sanitized
router.use(aiLimiter);
router.use(sanitizeAIInput);
router.post('/notes', protect, aiController.generateNotes);
router.post('/doubt', protect, aiController.solveDoubt);
router.post('/roadmap', protect, aiController.generateRoadmap);
router.post('/quiz', protect, aiController.generateQuiz);
router.post('/quiz/submit', protect, aiController.submitQuiz);
router.get('/quiz/history', protect, aiController.getQuizHistory);
router.post('/summary', protect, aiController.generateSummary);
router.post('/career', protect, aiController.careerGuidance);

module.exports = router;
