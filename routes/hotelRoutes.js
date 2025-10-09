const express = require('express');
const router = express.Router();
const {
  createHotel,
  getAllHotels,
  updateHotel,
  deactivateHotel,
  updateHotelSettings
} = require('../controllers/hotelController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes
router.get('/', getAllHotels); // Public for viewing hotels
router.post('/', authenticate, authorize('admin'), createHotel);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateHotel);
router.delete('/:id', authenticate, authorize('admin'), deactivateHotel);
router.patch('/:id/settings', authenticate, authorize('admin', 'manager'), updateHotelSettings);

module.exports = router;
