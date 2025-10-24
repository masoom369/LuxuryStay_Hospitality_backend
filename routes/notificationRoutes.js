const express = require('express');
const router = express.Router();
const {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deactivateNotification,
  getNotifications,
  markAsRead,
  sendNotificationEmail
} = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllNotifications);
router.get('/:id', authenticate, getNotificationById);
router.get('/:userId', authenticate, getNotifications);
router.post('/', authenticate, authorize('admin', 'manager'), createNotification);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateNotification);
router.delete('/:id', authenticate, authorize('admin'), deactivateNotification);
router.patch('/:id/read', authenticate, markAsRead);
router.post('/:id/send-email', authenticate, authorize('admin', 'manager'), sendNotificationEmail);

module.exports = router;
