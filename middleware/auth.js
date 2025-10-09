const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};

// Middleware to authorize based on roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // For guests, assignments is empty, so check if roles include 'guest' or if no roles required
    const userRoles = req.user.assignments?.map(a => a.role) || [];
    const isGuest = userRoles.length === 0;

    if (roles.length === 0) {
      // No specific roles required, allow authenticated users
      return next();
    }

    if (roles.includes('guest') && isGuest) {
      return next();
    }

    if (userRoles.some(role => roles.includes(role))) {
      return next();
    }

    res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
  };
};

module.exports = {
  authenticate,
  authorize
};
