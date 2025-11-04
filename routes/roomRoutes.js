// ==========================================
// routes/roomRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createRoom, getAllRooms, checkAvailability, getRoomById, updateRoom, updateRoomStatus, deleteRoom } = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRoom, handleValidationErrors } = require('../middleware/validation');
const { uploadRoomImages, handleMulterError } = require('../imghandler');

router.use(authenticate);

router.post('/', uploadRoomImages, handleMulterError, authorize({ roles: ['admin', 'manager'], resource: 'room' }), validateRoom, handleValidationErrors, createRoom);
router.get('/', authorize({ roles: ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'], resource: 'room' }), getAllRooms);
router.get('/availability', authorize({ roles: ['admin', 'manager', 'receptionist', 'guest'], resource: 'room' }), checkAvailability);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'], resource: 'room' }), getRoomById);
router.put('/:id', uploadRoomImages, handleMulterError, authorize({ roles: ['admin', 'manager'], resource: 'room' }), updateRoom);
router.patch('/:id/status', authorize({ roles: ['admin', 'manager', 'receptionist', 'housekeeping'], resource: 'room' }), updateRoomStatus);
router.delete('/:id', authorize({ roles: ['admin'], resource: 'room' }), deleteRoom);

module.exports = router;
