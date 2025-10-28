// ==========================================
// routes/index.js - Main Router
// ==========================================

const express = require('express');
const apiRoutes = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const hotelRoutes = require('./hotelRoutes');
const roomRoutes = require('./roomRoutes');
const reservationRoutes = require('./reservationRoutes');
const billingRoutes = require('./billingRoutes');
const housekeepingRoutes = require('./housekeepingRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const serviceRoutes = require('./serviceRoutes');
const configRoutes = require('./configRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Mount routes
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/hotels', hotelRoutes);
apiRoutes.use('/rooms', roomRoutes);
apiRoutes.use('/reservations', reservationRoutes);
apiRoutes.use('/billing', billingRoutes);
apiRoutes.use('/housekeeping', housekeepingRoutes);
apiRoutes.use('/maintenance', maintenanceRoutes);
apiRoutes.use('/feedback', feedbackRoutes);
apiRoutes.use('/services', serviceRoutes);
apiRoutes.use('/config', configRoutes);
apiRoutes.use('/notifications', notificationRoutes);
apiRoutes.use('/analytics', analyticsRoutes);

module.exports = apiRoutes;
