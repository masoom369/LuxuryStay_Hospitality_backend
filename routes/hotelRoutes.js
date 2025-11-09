
// ==========================================
// routes/hotelRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createHotel, getPublicHotels, getHotelById, updateHotel, deleteHotel, getAllHotels } = require('../controllers/hotelController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateHotel, handleValidationErrors } = require('../middleware/validation');
const { uploadHotelImages, handleMulterError } = require('../imghandler');

router.get('/', getPublicHotels);
router.get('/:id', getHotelById);

router.use(authenticate);
router.get('/all', authorize({ roles: ['admin'], resource: 'hotel' }), getAllHotels)
router.post('/', uploadHotelImages, handleMulterError, authorize({ roles: ['admin'], resource: 'hotel' }), validateHotel, handleValidationErrors, createHotel);

router.put('/:id', uploadHotelImages, handleMulterError, authorize({ roles: ['admin'], resource: 'hotel' }), updateHotel);
router.delete('/:id', authorize({ roles: ['admin'], resource: 'hotel' }), deleteHotel);

module.exports = router;