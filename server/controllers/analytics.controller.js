const User = require('../models/User');
const SearchHistory = require('../models/SearchHistory');
const QuizResult = require('../models/QuizResult');
const Progress = require('../models/Progress');
const Note = require('../models/Note');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard stats
// @route   GET /api/analytics/admin
exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalSearches, totalQuizzes, totalNotes] = await Promise.all([
      User.countDocuments(),
      SearchHistory.countDocuments(),
      QuizResult.countDocuments(),
      Note.countDocuments(),
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt');
    
    const popularSearches = await SearchHistory.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const userGrowth = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalSearches, totalQuizzes, totalNotes },
      recentUsers,
      popularSearches,
      userGrowth,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student dashboard stats
// @route   GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [bookmarks, quizResults, notes, notifications] = await Promise.all([
      Bookmark.countDocuments({ userId: req.user.id }),
      QuizResult.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5).select('-questions'),
      Note.countDocuments({ userId: req.user.id }),
      Notification.find({ userId: req.user.id, read: false }).limit(5),
    ]);

    const progress = await Progress.findOne({ userId: req.user.id });
    const recentSearches = await SearchHistory.find({ userId: req.user.id })
      .sort({ timestamp: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        bookmarks,
        quizzesTaken: quizResults.length,
        notes,
        streak: req.user.stats?.currentStreak || 0,
        watchTime: progress?.totalWatchTime || 0,
      },
      quizResults,
      notifications,
      recentSearches,
      progress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/analytics/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true }
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/analytics/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
