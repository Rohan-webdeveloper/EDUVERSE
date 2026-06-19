const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  videoId: { type: String, required: true },
  videoTitle: String,
  thumbnail: String,
  channelTitle: String,
  duration: String,
  viewCount: String,
  subject: String,
  exam: String,
  difficulty: String,
  provider: String,
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
const { wrapModel } = require('../utils/mockDb');
module.exports = wrapModel(Bookmark, 'Bookmark');
