const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deactivateServiceRequest,
  requestService,
  getServiceRequestsByUser,
  getServiceRequestsByHotel
} = require('../controllers/serviceRequestController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllServiceRequests);
router.get('/:id', authenticate, getServiceRequestById);
router.post('/', authenticate, requestService);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateServiceRequest);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deactivateServiceRequest);
router.patch('/:id', authenticate, authorize('admin', 'manager'), updateServiceRequest);
router.get('/user/:userId', authenticate, getServiceRequestsByUser);
router.get('/hotel/:hotelId', authenticate, authorize('admin', 'manager'), getServiceRequestsByHotel);

module.exports = router;
