const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deactivateBooking,
  updateBookingStatus,
  checkInBooking,
  checkOutBooking
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route for guest booking
router.post('/', createBooking);

// Protected routes
router.get('/', authenticate, authorize('admin', 'manager', 'receptionist'), getBookings);
router.get('/:id', authenticate, authorize('admin', 'manager', 'receptionist'), getBookingById);
router.put('/:id', authenticate, authorize('admin', 'manager', 'receptionist'), updateBooking);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deactivateBooking);
router.patch('/:id/status', authenticate, authorize('admin', 'manager', 'receptionist'), updateBookingStatus);
router.post('/:id/checkin', authenticate, authorize('admin', 'manager', 'receptionist'), checkInBooking);
router.post('/:id/checkout', authenticate, authorize('admin', 'manager', 'receptionist'), checkOutBooking);

module.exports = router;
