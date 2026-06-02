const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);
router.put('/:id/pin', notesController.togglePin);

module.exports = router;
