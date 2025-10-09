const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  getAvailableRooms
} = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes - staff access
router.get('/', authenticate, authorize('admin', 'manager', 'receptionist'), getAllRooms);
router.get('/available', getAvailableRooms); // Public for booking
router.get('/:id', authenticate, authorize('admin', 'manager', 'receptionist'), getRoomById);
router.post('/', authenticate, authorize('admin', 'manager'), createRoom);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateRoom);
router.patch('/:id/status', authenticate, authorize('admin', 'manager', 'receptionist', 'housekeeping'), updateRoomStatus);

module.exports = router;
