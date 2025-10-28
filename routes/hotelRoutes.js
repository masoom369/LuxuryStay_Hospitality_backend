
// ==========================================
// routes/hotelRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createHotel, getAllHotels, getHotelById, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateHotel, handleValidationErrors } = require('../middleware/validation');

router.use(authenticate);

router.post('/', authorize('admin'), validateHotel, handleValidationErrors, createHotel);
router.get('/', getAllHotels);
router.get('/:id', getHotelById);
router.put('/:id', authorize('admin'), updateHotel);
router.delete('/:id', authorize('admin'), deleteHotel);

module.exports = router;