// ==========================================
// routes/userRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser, assignHotel, getGuestStats, updateGuestPreferences } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize({ roles: ['admin'], resource: 'user' }), createUser);
router.get('/', authorize({ roles: ['admin', 'manager'], resource: 'user' }), getAllUsers);
router.get('/guest/stats', authorize({ roles: ['guest'], resource: 'user', ownerField: '_id' }), getGuestStats);
router.get('/:id', getUserById);
router.put('/guest/preferences', authorize({ roles: ['guest'], resource: 'user', ownerField: '_id' }), updateGuestPreferences);
router.put('/:id', authorize({ roles: ['admin', 'manager'], resource: 'user', ownerField: '_id' }), updateUser);
router.delete('/:id', authorize({ roles: ['admin'], resource: 'user', ownerField: '_id' }), deleteUser);
router.post('/assign-hotel', authorize({ roles: ['admin'], resource: 'user' }), assignHotel);

module.exports = router;