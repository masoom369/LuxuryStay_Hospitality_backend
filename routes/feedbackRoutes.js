const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getFeedbackByHotel
} = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes
router.post('/', authenticate, submitFeedback); // Guests can submit feedback
router.get('/hotel/:hotelId', authenticate, authorize('admin', 'manager'), getFeedbackByHotel);

module.exports = router;
