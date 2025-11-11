// ==========================================
// routes/serviceRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createServiceRequest, getAllServiceRequests, getServiceRequestById, updateServiceRequest, assignService, completeService, getGuestServiceRequests, getAvailableServices } = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Public endpoint for available services
router.get('/additional', getAvailableServices);

router.post('/', authorize({ roles: ['admin', 'guest'], resource: 'service', ownerField: 'guest' }), createServiceRequest);
router.get('/', authorize({ roles: ['admin', 'manager', 'receptionist', 'guest'], resource: 'service', ownerField: 'guest' }), getAllServiceRequests);
router.get('/guest', authorize({ roles: ['guest'], resource: 'service', ownerField: '_id' }), getGuestServiceRequests);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'receptionist', 'guest'], resource: 'service', ownerField: 'guest' }), getServiceRequestById);
router.put('/:id', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'service', ownerField: 'guest' }), updateServiceRequest);
router.post('/:id/assign', authorize({ roles: ['admin', 'manager'], resource: 'service', ownerField: 'guest' }), assignService);
router.post('/:id/complete', authorize({ roles: ['admin', 'manager'], resource: 'service', ownerField: 'guest' }), completeService);

module.exports = router;