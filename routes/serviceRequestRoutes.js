const express = require('express');
const router = express.Router();
const {
  requestService,
  updateServiceRequest,
  getServiceRequestsByUser,
  getServiceRequestsByHotel
} = require('../controllers/serviceRequestController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.post('/', authenticate, requestService);
router.patch('/:id', authenticate, authorize('admin', 'manager'), updateServiceRequest);
router.get('/user/:userId', authenticate, getServiceRequestsByUser);
router.get('/hotel/:hotelId', authenticate, authorize('admin', 'manager'), getServiceRequestsByHotel);

module.exports = router;
