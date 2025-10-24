const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deactivateInvoice,
  generateInvoice,
  getInvoiceByBooking,
  sendInvoiceEmail,
  printInvoice
} = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllInvoices);
router.get('/:id', authenticate, getInvoiceById);
router.post('/', authenticate, authorize('admin', 'manager'), generateInvoice);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateInvoice);
router.delete('/:id', authenticate, authorize('admin'), deactivateInvoice);
router.get('/booking/:bookingId', authenticate, getInvoiceByBooking);
router.post('/:id/send-email', authenticate, authorize('admin', 'manager'), sendInvoiceEmail);
router.get('/:id/print', authenticate, printInvoice);

module.exports = router;
