// ==========================================
// routes/authRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateUserRegistration, handleValidationErrors } = require('../middleware/validation');

router.post('/register', validateUserRegistration, handleValidationErrors, register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);

module.exports = router;