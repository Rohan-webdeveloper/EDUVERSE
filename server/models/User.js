const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  googleId: {
    type: String,
    sparse: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  preferences: {
    exam: { type: String, default: '' },
    subjects: [{ type: String }],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
  },
  stats: {
    totalWatchTime: { type: Number, default: 0 }, // in minutes
    videosWatched: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: Date,
    joinedDate: { type: Date, default: Date.now },
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak
userSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = this.stats.lastActiveDate ? new Date(this.stats.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  if (!lastActive || lastActive < today) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
      this.stats.currentStreak += 1;
    } else {
      this.stats.currentStreak = 1;
    }
    if (this.stats.currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.currentStreak;
    }
    this.stats.lastActiveDate = today;
  }
};

const User = mongoose.model('User', userSchema);
const { wrapModel } = require('../utils/mockDb');
module.exports = wrapModel(User, 'User');
