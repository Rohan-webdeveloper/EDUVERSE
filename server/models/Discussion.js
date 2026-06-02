const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userAvatar: String,
  content: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userName: String,
  userAvatar: String,
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true },
  tags: [String],
  subject: String,
  exam: String,
  relatedVideoId: String,
  answers: [answerSchema],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  isSolved: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

discussionSchema.index({ subject: 1, exam: 1 });
discussionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);
