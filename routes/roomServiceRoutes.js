// ==========================================
// routes/roomServiceRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { getMenuItems, placeOrder, getOrders, getOrderById } = require('../controllers/roomServiceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/menu', getMenuItems);
router.post('/order', authorize({ roles: ['guest'], resource: 'order', ownerField: 'customer' }), placeOrder);
router.get('/orders', authorize({ roles: ['guest'], resource: 'order', ownerField: 'customer' }), getOrders);
router.get('/orders/:id', authorize({ roles: ['guest'], resource: 'order', ownerField: 'customer' }), getOrderById);

module.exports = router;