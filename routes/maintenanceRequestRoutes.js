const express = require('express');
const router = express.Router();
const {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deactivateMaintenanceRequest,
  createRequest,
  updateRequestStatus,
  getRequestsByUser,
  getRequestsByHotel
} = require('../controllers/maintenanceRequestController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllMaintenanceRequests);
router.get('/:id', authenticate, getMaintenanceRequestById);
router.post('/', authenticate, createRequest);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateMaintenanceRequest);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deactivateMaintenanceRequest);
router.patch('/:id/status', authenticate, authorize('admin', 'manager'), updateRequestStatus);
router.get('/user/:userId', authenticate, getRequestsByUser);
router.get('/hotel/:hotelId', authenticate, authorize('admin', 'manager'), getRequestsByHotel);

module.exports = router;
