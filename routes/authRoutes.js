// ==========================================
// routes/authRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { register, login, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateUserRegistration, handleValidationErrors } = require('../middleware/validation');

router.post('/register', validateUserRegistration, handleValidationErrors, register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;