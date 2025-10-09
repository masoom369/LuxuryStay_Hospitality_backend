const express = require('express');
const router = express.Router();
const {
  getOccupancyRates,
  getRevenueReports,
  getFeedbackReports,
  getAnalytics
} = require('../controllers/reportingController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes - management access
router.get('/occupancy', authenticate, authorize('admin', 'manager'), getOccupancyRates);
router.get('/revenue', authenticate, authorize('admin', 'manager'), getRevenueReports);
router.get('/feedback', authenticate, authorize('admin', 'manager'), getFeedbackReports);
router.get('/analytics', authenticate, authorize('admin', 'manager'), getAnalytics);

module.exports = router;
