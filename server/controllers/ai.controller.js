const geminiService = require('../services/gemini.service');
const Note = require('../models/Note');
const QuizResult = require('../models/QuizResult');
const Notification = require('../models/Notification');

// @desc    Generate AI notes
// @route   POST /api/ai/notes
exports.generateNotes = async (req, res) => {
  try {
    const { topic, videoTitle, type, subject, exam, videoId, channelTitle } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

    const content = await geminiService.generateNotes({ topic, videoTitle, type: type || 'short', subject, exam });

    // Auto-save note if videoId provided
    if (videoId && req.user) {
      await Note.create({
        userId: req.user.id,
        videoId,
        videoTitle: videoTitle || topic,
        channelTitle,
        type: type || 'short',
        content,
        aiGenerated: true,
        subject,
        exam,
      });
    }

    res.json({ success: true, content, type: type || 'short' });
  } catch (error) {
    console.error("AI controller error in generateNotes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Solve a doubt
// @route   POST /api/ai/doubt
exports.solveDoubt = async (req, res) => {
  try {
    const { question, subject, exam, level } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

    const answer = await geminiService.solveDoubt({ question, subject, exam, level });
    res.json({ success: true, question, answer });
  } catch (error) {
    console.error("AI controller error in solveDoubt:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate study roadmap
// @route   POST /api/ai/roadmap
exports.generateRoadmap = async (req, res) => {
  try {
    const { goal, duration, currentLevel, subjects } = req.body;
    if (!goal) return res.status(400).json({ success: false, message: 'Goal is required' });

    const roadmap = await geminiService.generateRoadmap({ goal, duration: duration || '3 months', currentLevel, subjects });
    res.json({ success: true, goal, roadmap });
  } catch (error) {
    console.error("AI controller error in generateRoadmap:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate quiz
// @route   POST /api/ai/quiz
exports.generateQuiz = async (req, res) => {
  try {
    const { topic, subject, difficulty, numQuestions, exam } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

    const questions = await geminiService.generateQuiz({
      topic, subject, difficulty: difficulty || 'intermediate',
      numQuestions: parseInt(numQuestions) || 10, exam
    });

    res.json({ success: true, topic, questions, difficulty: difficulty || 'intermediate' });
  } catch (error) {
    console.error("AI controller error in generateQuiz:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit quiz and evaluate
// @route   POST /api/ai/quiz/submit
exports.submitQuiz = async (req, res) => {
  try {
    const { topic, subject, exam, difficulty, questions, timeTaken } = req.body;

    const answeredQuestions = questions.map(q => ({
      ...q,
      isCorrect: q.selectedAnswer === q.correctAnswer,
    }));

    const score = answeredQuestions.filter(q => q.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    const feedback = await geminiService.evaluateQuiz({ topic, questions: answeredQuestions, score, percentage });

    const result = await QuizResult.create({
      userId: req.user.id,
      topic, subject, exam, difficulty,
      questions: answeredQuestions,
      score, totalQuestions: questions.length,
      percentage, timeTaken, passed,
      aiGeneratedFeedback: feedback,
    });

    // Achievement notification
    if (percentage === 100) {
      await Notification.create({
        userId: req.user.id,
        type: 'achievement',
        title: '🏆 Perfect Score!',
        message: `You scored 100% on ${topic}! Amazing performance!`,
      });
    }

    res.json({ success: true, result, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate video summary
// @route   POST /api/ai/summary
exports.generateSummary = async (req, res) => {
  try {
    const { videoTitle, topic, channelTitle } = req.body;
    if (!videoTitle) return res.status(400).json({ success: false, message: 'Video title is required' });

    const summary = await geminiService.generateSummary({ videoTitle, topic, channelTitle });
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Career guidance
// @route   POST /api/ai/career
exports.careerGuidance = async (req, res) => {
  try {
    const { interests, skills, currentLevel, goal } = req.body;
    if (!interests) return res.status(400).json({ success: false, message: 'Interests are required' });

    const guidance = await geminiService.generateCareerGuidance({ interests, skills: skills || '', currentLevel: currentLevel || 'student', goal });
    res.json({ success: true, guidance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quiz history
// @route   GET /api/ai/quiz/history
exports.getQuizHistory = async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-questions');
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
