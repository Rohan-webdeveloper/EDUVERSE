const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.get('/dashboard', protect, analyticsController.getDashboardStats);
router.put('/notifications/:id/read', protect, analyticsController.markNotificationRead);
router.get('/admin', protect, adminOnly, analyticsController.getAdminStats);
router.get('/users', protect, adminOnly, analyticsController.getAllUsers);

module.exports = router;
