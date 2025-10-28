// ==========================================
// routes/notificationRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createNotification, getMyNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('admin', 'manager'), createNotification);
router.get('/my-notifications', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;