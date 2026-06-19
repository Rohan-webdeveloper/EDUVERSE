const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  query: {
    type: String,
    required: true,
    trim: true,
  },
  filters: {
    exam: String,
    subject: String,
    provider: String,
    duration: String,
    difficulty: String,
  },
  resultCount: { type: Number, default: 0 },
  clickedVideoId: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

searchHistorySchema.index({ userId: 1, timestamp: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
const { wrapModel } = require('../utils/mockDb');
module.exports = wrapModel(SearchHistory, 'SearchHistory');
