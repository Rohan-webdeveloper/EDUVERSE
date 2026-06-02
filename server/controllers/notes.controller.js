const Note = require('../models/Note');

// @desc    Get all notes
// @route   GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const { subject, exam, videoId } = req.query;
    const filter = { userId: req.user.id };
    if (subject) filter.subject = subject;
    if (exam) filter.exam = exam;
    if (videoId) filter.videoId = videoId;
    const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create note
// @route   POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({ userId: req.user.id, ...req.body });
    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle pin
// @route   PUT /api/notes/:id/pin
exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    note.isPinned = !note.isPinned;
    await note.save();
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
