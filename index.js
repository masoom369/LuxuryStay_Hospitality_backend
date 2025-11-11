// server.js - Hotel Management System Main Server
const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectDatabase } = require('./config/db');
const { setupApiRoutes } = require('./config/api');
const apiRoutes = require('./routes/');
require('dotenv').config();
// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// CORS Configuration
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Custom request logger
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(`[${req.requestTime}] ${req.method} ${req.originalUrl}`);
//   next();
// });
// Logging middleware for debugging request bodies
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  console.log('Request body:', req.body);
  next();
});
// Connect to database
connectDatabase();

// Setup health check and API info routes
setupApiRoutes(app);

// Mount all routes
app.use('/api', apiRoutes);

// 404 handler - Must be after all other routes
app.use(notFound);

// Global error handler - Must be last
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// ==============================================
// START SERVER
// ==============================================

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log('Hotel Management System Server Started');
  console.log(`Server URL: http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});