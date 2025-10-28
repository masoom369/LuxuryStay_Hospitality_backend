// ==========================================
// routes/feedbackRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback, getFeedbackById, respondToFeedback, publishFeedback } = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize({ roles: ['admin', 'guest'], resource: 'feedback', ownerField: 'guest' }), createFeedback);
router.get('/', authorize({ roles: ['admin', 'manager', 'guest'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), getAllFeedback);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'guest'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), getFeedbackById);
router.post('/:id/respond', authorize({ roles: ['admin', 'manager'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), respondToFeedback);
router.post('/:id/publish', authorize({ roles: ['admin', 'manager'], resource: 'feedback', ownerField: 'guest', populatePath: 'reservation' }), publishFeedback);

module.exports = router;