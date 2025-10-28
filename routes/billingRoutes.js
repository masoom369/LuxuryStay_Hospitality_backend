// ==========================================
// routes/billingRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createBill, getAllBills, getBillById, updateBill, recordPayment } = require('../controllers/billingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('admin', 'manager', 'receptionist'), createBill);
router.get('/', getAllBills);
router.get('/:id', getBillById);
router.put('/:id', authorize('admin', 'manager', 'receptionist'), updateBill);
router.post('/:id/payment', authorize('admin', 'manager', 'receptionist'), recordPayment);

module.exports = router;