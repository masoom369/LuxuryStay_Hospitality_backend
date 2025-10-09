const express = require('express');
const router = express.Router();
const {
  assignTask,
  updateTaskStatus,
  getRoomsForHousekeeping,
  scheduleTask,
  reportMaintenanceIssue
} = require('../controllers/housekeepingTaskController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.post('/', authenticate, authorize('admin', 'manager'), assignTask);
router.patch('/:id/status', authenticate, authorize('admin', 'manager', 'housekeeping'), updateTaskStatus);
router.get('/rooms', authenticate, authorize('admin', 'manager', 'housekeeping'), getRoomsForHousekeeping);
router.post('/schedule', authenticate, authorize('admin', 'manager'), scheduleTask);
router.post('/maintenance', authenticate, reportMaintenanceIssue); // Allow guests to report

module.exports = router;
