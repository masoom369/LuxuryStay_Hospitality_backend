// ==========================================
// routes/configRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createConfig, getAllConfigs, getConfigByKey, updateConfig, deleteConfig } = require('../controllers/configController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize({ roles: ['admin'], resource: 'config' }));

router.post('/', createConfig);
router.get('/', getAllConfigs);
router.get('/:key', getConfigByKey);
router.put('/:key', updateConfig);
router.delete('/:key', deleteConfig);

module.exports = router;