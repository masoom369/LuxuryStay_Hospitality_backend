// ==========================================
// routes/feedbackRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback, getFeedbackById, respondToFeedback, publishFeedback, getFeedbackByHotelId } = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route for getting feedback by hotel ID (for public hotel pages)
router.get('/hotel/:hotelId', getFeedbackByHotelId);
router.get('/', getAllFeedback);

router.use(authenticate);

router.post('/', authorize({ roles: ['admin', 'guest'], resource: 'feedback', ownerField: 'guest' }), createFeedback);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'guest'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), getFeedbackById);
router.post('/:id/respond', authorize({ roles: ['admin', 'manager'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), respondToFeedback);
router.post('/:id/publish', authorize({ roles: ['admin', 'manager'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), publishFeedback);

module.exports = router;