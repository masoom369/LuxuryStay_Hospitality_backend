// ==========================================
// routes/roomRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createRoom, getAllRooms, checkAvailability, getRoomById, updateRoom, updateRoomStatus, deleteRoom, getRoomByHotelId } = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRoom, handleValidationErrors } = require('../middleware/validation');
const { uploadRoomImages, handleMulterError } = require('../imghandler');

// Public route for getting rooms by hotel ID (for public hotel pages)
router.get('/hotel/:hotelId', getRoomByHotelId);
router.get('/',  getAllRooms);
router.get('/availability', checkAvailability);

// Public route for getting a room by ID (for public room detail page)
router.get('/:id', getRoomById);

router.use(authenticate);

router.post('/', uploadRoomImages, handleMulterError, authorize({ roles: ['admin', 'manager'], resource: 'room' }), validateRoom, handleValidationErrors, createRoom);
router.put('/:id', uploadRoomImages, handleMulterError, authorize({ roles: ['admin', 'manager'], resource: 'room' }), updateRoom);
router.patch('/:id/status', authorize({ roles: ['admin', 'manager', 'receptionist', 'housekeeping'], resource: 'room' }), updateRoomStatus);
router.delete('/:id', authorize({ roles: ['admin'], resource: 'room' }), deleteRoom);

module.exports = router;
