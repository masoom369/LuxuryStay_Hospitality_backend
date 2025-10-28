// ==========================================
// routes/billingRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createBill, getAllBills, getBillById, updateBill, recordPayment } = require('../controllers/billingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'billing', ownerField: 'guest', populatePath: 'reservation.room' }), createBill);
router.get('/', authorize({ roles: ['admin', 'manager', 'receptionist', 'guest'], resource: 'billing', ownerField: 'guest', populatePath: 'reservation.room' }), getAllBills);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'receptionist', 'guest'], resource: 'billing', ownerField: 'guest', populatePath: 'reservation.room' }), getBillById);
router.put('/:id', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'billing', ownerField: 'guest', populatePath: 'reservation.room' }), updateBill);
router.post('/:id/payment', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'billing', ownerField: 'guest', populatePath: 'reservation.room' }), recordPayment);

module.exports = router;