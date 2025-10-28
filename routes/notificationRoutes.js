// ==========================================
// routes/notificationRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createNotification, getMyNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize({ roles: ['admin', 'manager'], resource: 'notification', ownerField: 'recipient' }), createNotification);
router.get('/my-notifications', authorize({ roles: ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'], resource: 'notification', ownerField: 'recipient' }), getMyNotifications);
router.patch('/:id/read', authorize({ roles: ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'], resource: 'notification', ownerField: 'recipient' }), markAsRead);
router.patch('/read-all', authorize({ roles: ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'], resource: 'notification', ownerField: 'recipient' }), markAllAsRead);
router.delete('/:id', authorize({ roles: ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'], resource: 'notification', ownerField: 'recipient' }), deleteNotification);

module.exports = router;