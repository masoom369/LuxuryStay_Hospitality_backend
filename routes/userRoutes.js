// ==========================================
// routes/userRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser, assignHotel } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('admin'), createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', authorize('admin', 'manager'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.post('/assign-hotel', authorize('admin'), assignHotel);

module.exports = router;