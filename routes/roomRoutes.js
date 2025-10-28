// ==========================================
// routes/roomRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createRoom, getAllRooms, checkAvailability, getRoomById, updateRoom, updateRoomStatus, deleteRoom } = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRoom, handleValidationErrors } = require('../middleware/validation');

router.use(authenticate);

router.post('/', authorize('admin', 'manager'), validateRoom, handleValidationErrors, createRoom);
router.get('/', getAllRooms);
router.get('/availability', checkAvailability);
router.get('/:id', getRoomById);
router.put('/:id', authorize('admin', 'manager'), updateRoom);
router.patch('/:id/status', authorize('admin', 'manager', 'receptionist', 'housekeeping'), updateRoomStatus);
router.delete('/:id', authorize('admin'), deleteRoom);

module.exports = router;
