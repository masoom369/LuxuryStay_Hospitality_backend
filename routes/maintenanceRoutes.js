// ==========================================
// routes/maintenanceRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createMaintenanceRequest, getAllMaintenanceRequests, getMaintenanceRequestById, updateMaintenanceRequest, assignMaintenance, completeMaintenanceRequest } = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize({ roles: ['admin', 'manager'] }), createMaintenanceRequest);
router.get('/', authorize({ roles: ['admin', 'manager', 'maintenance'], resource: 'maintenance', populatePath: 'room' }), getAllMaintenanceRequests);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'maintenance'], resource: 'maintenance', populatePath: 'room' }), getMaintenanceRequestById);
router.put('/:id', authorize({ roles: ['admin', 'manager', 'maintenance'], resource: 'maintenance', populatePath: 'room' }), updateMaintenanceRequest);
router.post('/:id/assign', authorize({ roles: ['admin', 'manager'], resource: 'maintenance', populatePath: 'room' }), assignMaintenance);
router.post('/:id/complete', authorize({ roles: ['admin', 'manager', 'maintenance'], resource: 'maintenance', populatePath: 'room' }), completeMaintenanceRequest);

module.exports = router;