// ==========================================
// routes/feedbackRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback, getFeedbackById, respondToFeedback, publishFeedback } = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createFeedback);
router.get('/', getAllFeedback);
router.get('/:id', getFeedbackById);
router.post('/:id/respond', authorize('admin', 'manager'), respondToFeedback);
router.post('/:id/publish', authorize('admin', 'manager'), publishFeedback);

module.exports = router;