const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  createNotification,
  sendNotificationEmail
} = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.get('/:userId', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.post('/', authenticate, authorize('admin', 'manager'), createNotification);
router.post('/:id/send-email', authenticate, authorize('admin', 'manager'), sendNotificationEmail);

module.exports = router;
