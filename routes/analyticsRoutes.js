// ==========================================
// routes/analyticsRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { getDashboardStats, getOccupancyReport, getRevenueReport, getGuestReport, getStaffPerformanceReport, getFeedbackAnalytics, getPerformanceMetrics } = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize({ roles: ['admin', 'manager'] }));

router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats);
router.get('/performance', getPerformanceMetrics);
router.get('/occupancy', getOccupancyReport);
router.get('/revenue', getRevenueReport);
router.get('/guests', getGuestReport);
router.get('/staff-performance', getStaffPerformanceReport);
router.get('/feedback-analytics', getFeedbackAnalytics);

module.exports = router;