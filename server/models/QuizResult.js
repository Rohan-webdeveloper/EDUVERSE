const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  topic: { type: String, required: true },
  subject: String,
  exam: String,
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    selectedAnswer: Number,
    explanation: String,
    isCorrect: Boolean,
  }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: Number,
  timeTaken: Number, // seconds
  aiGeneratedFeedback: String,
  passed: { type: Boolean, default: false },
}, { timestamps: true });

quizResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
