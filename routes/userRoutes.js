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
  changePassword,
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
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, authorize(), getUserById); // Any authenticated user can view profiles
router.put('/:id', authenticate, authorize(), updateUser); // Any authenticated user can update profiles (with additional checks in controller if needed)
router.put('/change-password', authenticate, authorize(), changePassword); // Any authenticated user can change their own password
router.put('/:id/admin/deactivate', authenticate, authorize('admin'), deactivateUser); // Admin can activate/deactivate any user
router.put('/:id/deactivate', authenticate, authorize('guest'), deactivateUser); // Guests can only deactivate themselves

module.exports = router;
