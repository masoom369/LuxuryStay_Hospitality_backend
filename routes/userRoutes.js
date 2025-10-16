const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  register,
  login,
  forgotPassword,
  resetPassword,
  createStaff
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/create-staff', authenticate, authorize('admin'), createStaff);
router.get('/me', authenticate, getUserById); // Get current user's details
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.put('/:id/status', authenticate, authorize('admin'), deactivateUser); // Admin can activate/deactivate any user
router.put('/:id/deactivate', authenticate, authorize('guest'), deactivateUser); // Guests can only deactivate themselves

module.exports = router;
