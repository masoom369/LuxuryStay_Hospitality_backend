const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deactivateFeedback,
  submitFeedback,
  getFeedbackByHotel
} = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllFeedback);
router.get('/:id', authenticate, authorize('admin', 'manager'), getFeedbackById);
router.post('/', authenticate, submitFeedback); // Guests can submit feedback
router.put('/:id', authenticate, authorize('admin', 'manager'), updateFeedback);
router.delete('/:id', authenticate, authorize('admin'), deactivateFeedback);
router.get('/hotel/:hotelId', authenticate, authorize('admin', 'manager'), getFeedbackByHotel);

module.exports = router;
