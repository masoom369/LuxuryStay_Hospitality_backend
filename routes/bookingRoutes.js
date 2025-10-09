const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  checkInBooking,
  checkOutBooking
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route for guest booking
router.post('/', createBooking);

// Protected routes
router.get('/', authenticate, authorize('admin', 'manager', 'receptionist'), getBookings);
router.patch('/:id/status', authenticate, authorize('admin', 'manager', 'receptionist'), updateBookingStatus);
router.post('/:id/checkin', authenticate, authorize('admin', 'manager', 'receptionist'), checkInBooking);
router.post('/:id/checkout', authenticate, authorize('admin', 'manager', 'receptionist'), checkOutBooking);

module.exports = router;
