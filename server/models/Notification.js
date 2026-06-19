const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['quiz_result', 'streak', 'achievement', 'answer', 'system', 'roadmap'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  icon: String,
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
const { wrapModel } = require('../utils/mockDb');
module.exports = wrapModel(Notification, 'Notification');
