const mongoose = require('mongoose');

const watchedVideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: String,
  channelTitle: String,
  thumbnail: String,
  subject: String,
  exam: String,
  watchedAt: { type: Date, default: Date.now },
  watchDuration: { type: Number, default: 0 }, // seconds watched
  completed: { type: Boolean, default: false },
});

const dailyGoalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  targetMinutes: { type: Number, default: 60 },
  achievedMinutes: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  watchedVideos: [watchedVideoSchema],
  dailyGoals: [dailyGoalSchema],
  subjectProgress: {
    type: Map,
    of: Number,
    default: {},
  },
  totalWatchTime: { type: Number, default: 0 },
  weakTopics: [String],
  strongTopics: [String],
  completedTopics: [String],
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStudyDate: Date,
  weeklyData: [{
    week: String,
    minutes: { type: Number, default: 0 },
    videos: { type: Number, default: 0 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
