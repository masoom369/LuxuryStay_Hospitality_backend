const express = require('express');
const router = express.Router();
const {
  createService,
  getAllServiceCatalogs,
  getServiceCatalogById,
  updateServiceCatalog,
  deactivateServiceCatalog,
  getServicesByHotel,
  getServicesByCategory
} = require('../controllers/serviceCatalogController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes
router.get('/', authenticate, authorize('admin', 'manager'), getAllServiceCatalogs);
router.get('/:id', authenticate, getServiceCatalogById);
router.get('/hotel/:hotelId', getServicesByHotel); // Public for viewing
router.post('/', authenticate, authorize('admin', 'manager'), createService);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateServiceCatalog);
router.delete('/:id', authenticate, authorize('admin'), deactivateServiceCatalog);
router.get('/category/:category', getServicesByCategory); // Public

module.exports = router;
