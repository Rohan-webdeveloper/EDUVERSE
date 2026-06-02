const Discussion = require('../models/Discussion');

// @desc    Get all discussions
// @route   GET /api/community
exports.getDiscussions = async (req, res) => {
  try {
    const { subject, exam, tag, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (exam) filter.exam = exam;
    if (tag) filter.tags = tag;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const discussions = await Discussion.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-answers');

    const total = await Discussion.countDocuments(filter);
    res.json({ success: true, discussions, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create discussion
// @route   POST /api/community
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, tags, subject, exam, relatedVideoId } = req.body;
    const discussion = await Discussion.create({
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      title, content, tags, subject, exam, relatedVideoId,
    });
    res.status(201).json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single discussion
// @route   GET /api/community/:id
exports.getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });
    res.json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add answer
// @route   POST /api/community/:id/answers
exports.addAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    discussion.answers.push({
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      content,
    });
    await discussion.save();
    res.json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote discussion
// @route   PUT /api/community/:id/upvote
exports.upvoteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Not found' });

    const idx = discussion.upvotes.indexOf(req.user.id);
    if (idx > -1) {
      discussion.upvotes.splice(idx, 1);
    } else {
      discussion.upvotes.push(req.user.id);
    }
    await discussion.save();
    res.json({ success: true, upvotes: discussion.upvotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
