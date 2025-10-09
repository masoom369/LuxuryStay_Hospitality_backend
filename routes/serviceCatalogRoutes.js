const express = require('express');
const router = express.Router();
const {
  getServicesByHotel,
  createService,
  getServicesByCategory
} = require('../controllers/serviceCatalogController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes
router.get('/hotel/:hotelId', getServicesByHotel); // Public for viewing
router.post('/', authenticate, authorize('admin', 'manager'), createService);
router.get('/category/:category', getServicesByCategory); // Public

module.exports = router;
