const express = require('express');
const router = express.Router();
const {
  createContactUs,
  getAllContactUs,
  getContactUsById,
  updateContactUs,
  deactivateContactUs,
  submitContactForm,
  respondToMessage
} = require('../controllers/contactUsController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllContactUs);
router.get('/:id', authenticate, authorize('admin', 'manager'), getContactUsById);
router.post('/', submitContactForm); // Public
router.put('/:id', authenticate, authorize('admin', 'manager'), updateContactUs);
router.delete('/:id', authenticate, authorize('admin'), deactivateContactUs);
router.patch('/:id/respond', authenticate, authorize('admin', 'manager'), respondToMessage);

module.exports = router;
