const express = require('express');
const router = express.Router();
const {
  generateInvoice,
  getInvoiceByBooking,
  sendInvoiceEmail,
  printInvoice
} = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.post('/', authenticate, authorize('admin', 'manager'), generateInvoice);
router.get('/booking/:bookingId', authenticate, getInvoiceByBooking);
router.post('/:id/send-email', authenticate, authorize('admin', 'manager'), sendInvoiceEmail);
router.get('/:id/print', authenticate, printInvoice);

module.exports = router;
