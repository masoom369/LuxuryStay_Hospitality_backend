const express = require('express');
const router = express.Router();
const {
  createRequest,
  updateRequestStatus,
  getRequestsByUser,
  getRequestsByHotel
} = require('../controllers/maintenanceRequestController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.post('/', authenticate, createRequest);
router.patch('/:id/status', authenticate, authorize('admin', 'manager'), updateRequestStatus);
router.get('/user/:userId', authenticate, getRequestsByUser);
router.get('/hotel/:hotelId', authenticate, authorize('admin', 'manager'), getRequestsByHotel);

module.exports = router;
