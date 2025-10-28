// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ 
      _id: decoded.userId, 
      isActive: true, 
      deletedAt: null 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found' 
      });
    }

    req.user = {
      userId: user._id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
};

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Hotel assignment verification
const verifyHotelAccess = async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId || req.query.hotel || req.body.hotel;
    
    // Admin has access to all hotels
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user is assigned to this hotel
    const user = await User.findById(req.user.userId);
    const hasAccess = user.assignments.some(
      assignment => assignment.hotel.toString() === hotelId
    );

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have access to this hotel' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Access verification failed',
      error: error.message 
    });
  }
};

// Guest access verification
const verifyGuestAccess = async (req, res, next) => {
  try {
    const guestId = req.params.guestId || req.query.guest || req.body.guest;
    
    // Admin and staff can access all guest data
    if (['admin', 'manager', 'receptionist'].includes(req.user.role)) {
      return next();
    }

    // Guests can only access their own data
    if (req.user.role === 'guest' && req.user.userId.toString() !== guestId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only access your own data' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Access verification failed',
      error: error.message 
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  verifyHotelAccess,
  verifyGuestAccess
};
