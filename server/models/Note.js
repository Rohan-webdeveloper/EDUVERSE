const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  videoId: { type: String, required: true },
  videoTitle: String,
  channelTitle: String,
  type: {
    type: String,
    enum: ['short', 'long', 'formula', 'concepts', 'questions', 'custom'],
    default: 'custom',
  },
  content: { type: String, required: true },
  aiGenerated: { type: Boolean, default: false },
  tags: [String],
  subject: String,
  exam: String,
  isPinned: { type: Boolean, default: false },
  color: { type: String, default: '#6366f1' },
}, { timestamps: true });

noteSchema.index({ userId: 1, videoId: 1 });
noteSchema.index({ userId: 1, subject: 1 });

const Note = mongoose.model('Note', noteSchema);
const { wrapModel } = require('../utils/mockDb');
module.exports = wrapModel(Note, 'Note');
