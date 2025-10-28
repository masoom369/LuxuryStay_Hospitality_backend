// ==========================================
// routes/housekeepingRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createHousekeepingTask, getAllHousekeepingTasks, getHousekeepingTaskById, updateHousekeepingTask, startTask, completeTask } = require('../controllers/housekeepingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('admin', 'manager', 'housekeeping'), createHousekeepingTask);
router.get('/', getAllHousekeepingTasks);
router.get('/:id', getHousekeepingTaskById);
router.put('/:id', authorize('admin', 'manager', 'housekeeping'), updateHousekeepingTask);
router.post('/:id/start', authorize('housekeeping', 'manager'), startTask);
router.post('/:id/complete', authorize('housekeeping', 'manager'), completeTask);

module.exports = router;