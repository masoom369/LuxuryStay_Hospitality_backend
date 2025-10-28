// ==========================================
// routes/maintenanceRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createMaintenanceRequest, getAllMaintenanceRequests, getMaintenanceRequestById, updateMaintenanceRequest, assignMaintenance, completeMaintenanceRequest } = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createMaintenanceRequest);
router.get('/', getAllMaintenanceRequests);
router.get('/:id', getMaintenanceRequestById);
router.put('/:id', authorize('admin', 'manager', 'maintenance'), updateMaintenanceRequest);
router.post('/:id/assign', authorize('admin', 'manager'), assignMaintenance);
router.post('/:id/complete', authorize('admin', 'manager', 'maintenance'), completeMaintenanceRequest);

module.exports = router;