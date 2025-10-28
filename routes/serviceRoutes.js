// ==========================================
// routes/serviceRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createServiceRequest, getAllServiceRequests, getServiceRequestById, updateServiceRequest, assignService, completeService } = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createServiceRequest);
router.get('/', getAllServiceRequests);
router.get('/:id', getServiceRequestById);
router.put('/:id', authorize('admin', 'manager', 'receptionist'), updateServiceRequest);
router.post('/:id/assign', authorize('admin', 'manager'), assignService);
router.post('/:id/complete', authorize('admin', 'manager'), completeService);

module.exports = router;