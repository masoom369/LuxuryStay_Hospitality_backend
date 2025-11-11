// ==========================================
// routes/feedbackRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback, getFeedbackById, respondToFeedback, updateFeedbackStatus, publishFeedback, getFeedbackByHotelId, getFeedbackByRoomId, getRecentFeedback } = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes for getting feedback
router.get('/hotel/:hotelId', getFeedbackByHotelId);
router.get('/room/:roomId', getFeedbackByRoomId);
router.get('/', getAllFeedback);

// Apply authentication middleware to all routes below this line
router.use(authenticate);

// Protected routes for authenticated users
router.post('/', authorize({ roles: ['admin', 'guest'], resource: 'feedback', ownerField: 'guest' }), createFeedback);
router.get('/recent', authorize({ roles: ['guest'], resource: 'feedback', ownerField: 'guest' }), getRecentFeedback);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'guest'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), getFeedbackById);
router.put('/:id/status', authorize({ roles: ['admin', 'manager'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), updateFeedbackStatus);
router.post('/:id/respond', authorize({ roles: ['admin', 'manager'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), respondToFeedback);
router.post('/:id/publish', authorize({ roles: ['admin', 'manager'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), publishFeedback);

module.exports = router;