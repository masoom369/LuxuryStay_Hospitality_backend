
// ==========================================
// routes/hotelRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createHotel, getAllHotels, getHotelById, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateHotel, handleValidationErrors } = require('../middleware/validation');
const { uploadHotelImages, handleMulterError } = require('../imghandler');

router.use(authenticate);

router.post('/', uploadHotelImages, handleMulterError, authorize({ roles: ['admin'], resource: 'hotel' }), validateHotel, handleValidationErrors, createHotel);
router.get('/', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'hotel' }), getAllHotels);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'hotel' }), getHotelById);
router.put('/:id', uploadHotelImages, handleMulterError, authorize({ roles: ['admin'], resource: 'hotel' }), updateHotel);
router.delete('/:id', authorize({ roles: ['admin'], resource: 'hotel' }), deleteHotel);

module.exports = router;