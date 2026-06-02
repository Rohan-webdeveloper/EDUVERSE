const mongoose = require('mongoose');

const videoItemSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: String,
  thumbnail: String,
  channelTitle: String,
  duration: String,
  addedAt: { type: Date, default: Date.now },
});

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: { type: String, maxlength: 500 },
  thumbnail: String,
  videos: [videoItemSchema],
  isPublic: { type: Boolean, default: false },
  tags: [String],
  exam: String,
  subject: String,
  totalVideos: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-update totalVideos
playlistSchema.pre('save', function (next) {
  this.totalVideos = this.videos.length;
  next();
});

module.exports = mongoose.model('Playlist', playlistSchema);
