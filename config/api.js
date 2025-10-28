const mongoose = require('mongoose');

const setupApiRoutes = (app) => {
  // Health check endpoint
  app.get('/health', (req, res) => {
    const healthCheck = {
      success: true,
      message: 'Hotel Management System API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      },
      version: '1.0.0',
    };

    const status = mongoose.connection.readyState === 1 ? 200 : 503;
    res.status(status).json(healthCheck);
  });

  // API Info endpoint
  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Hotel Management System API',
      version: '1.0.0',
      documentation: '/api/docs',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        hotels: '/api/hotels',
        rooms: '/api/rooms',
        reservations: '/api/reservations',
        billing: '/api/billing',
        housekeeping: '/api/housekeeping',
        maintenance: '/api/maintenance',
        feedback: '/api/feedback',
        services: '/api/services',
        config: '/api/config',
        notifications: '/api/notifications',
        analytics: '/api/analytics',
      }
    });
  });
};

module.exports = { setupApiRoutes };
