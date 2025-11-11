// ==========================================
// routes/reportsRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { exportReport } = require('../controllers/reportsController');

router.use(authenticate);
router.use(authorize({ roles: ['admin', 'manager'] }));

router.post('/export', exportReport);

module.exports = router;