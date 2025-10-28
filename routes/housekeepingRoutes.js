// ==========================================
// routes/housekeepingRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createHousekeepingTask, getAllHousekeepingTasks, getHousekeepingTaskById, updateHousekeepingTask, startTask, completeTask } = require('../controllers/housekeepingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize({ roles: ['admin', 'manager', 'housekeeping'], resource: 'housekeeping', populatePath: 'room' }), createHousekeepingTask);
router.get('/', authorize({ roles: ['admin', 'manager', 'housekeeping'], resource: 'housekeeping', populatePath: 'room' }), getAllHousekeepingTasks);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'housekeeping'], resource: 'housekeeping', populatePath: 'room' }), getHousekeepingTaskById);
router.put('/:id', authorize({ roles: ['admin', 'manager', 'housekeeping'], resource: 'housekeeping', populatePath: 'room' }), updateHousekeepingTask);
router.post('/:id/start', authorize({ roles: ['housekeeping', 'manager'], resource: 'housekeeping', populatePath: 'room' }), startTask);
router.post('/:id/complete', authorize({ roles: ['housekeeping', 'manager'], resource: 'housekeeping', populatePath: 'room' }), completeTask);

module.exports = router;