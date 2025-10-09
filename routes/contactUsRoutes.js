const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  respondToMessage
} = require('../controllers/contactUsController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes
router.post('/', submitContactForm); // Public
router.patch('/:id/respond', authenticate, authorize('admin', 'manager'), respondToMessage);

module.exports = router;
