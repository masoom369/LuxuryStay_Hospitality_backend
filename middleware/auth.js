// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/');

// ======================
// 1. AUTHENTICATE
// ======================
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
    }).select('_id role email assignments');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found' 
      });
    }

    // Attach user context to request
    req.user = {
      userId: user._id,
      role: user.role,
      email: user.email,
      isAdmin: user.role === 'admin',
      isGuest: user.role === 'guest',
      isStaff: !['admin', 'guest'].includes(user.role),
      assignedHotelIds: user.assignments?.map(a => a.hotel.toString()) || []
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

// ======================
// 2. AUTHORIZE (Dynamic)
// ======================
const authorize = (config = {}) => {
  const {
    roles = [], // Allowed roles
    resource = null, // 'hotel' | 'room' | 'reservation' | 'billing' | etc.
    ownerField = null, // Field name for ownership check (e.g., 'guest', 'user')
    hotelField = 'hotel', // Field containing hotel reference
    populatePath = null // Path to populate if hotel is nested (e.g., 'room.hotel')
  } = config;

  return async (req, res, next) => {
    try {
      const { user } = req;

      // === STEP 1: Role Check ===
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // === STEP 2: Admin Bypass ===
      if (user.isAdmin) {
        return next();
      }

      // === STEP 3: No Resource Check (Just Role) ===
      if (!resource) {
        return next();
      }

      // === STEP 4: Resource-Based Access Control ===
      const resourceId = req.params.id || req.params[`${resource}Id`];
      
      // For LIST operations (no specific ID)
      if (!resourceId) {
        return applyListFilters(req, user, resource, hotelField);
      }

      // For ITEM operations (specific ID)
      return await verifyItemAccess(req, res, next, user, resource, resourceId, {
        ownerField,
        hotelField,
        populatePath
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
};

// ======================
// Helper: Apply Filters for List Operations
// ======================
const applyListFilters = (req, user, resource, hotelField) => {
  const { isGuest, isStaff, assignedHotelIds, userId } = user;

  // Guests: Only their own data
  if (isGuest) {
    req.accessFilter = { 
      $or: [
        { guest: userId },
        { user: userId }
      ]
    };
    return req.next ? req.next() : Promise.resolve();
  }

  // Staff: Only assigned hotels
  if (isStaff) {
    if (assignedHotelIds.length === 0) {
      return req.res.status(403).json({
        success: false,
        message: 'No hotel assignments found'
      });
    }

    // Direct hotel reference
    if (['hotel', 'room', 'config'].includes(resource)) {
      req.accessFilter = {
        [hotelField]: { $in: assignedHotelIds }
      };
    }
    // Nested hotel reference (via room, reservation, etc.)
    else {
      req.accessFilter = {
        [`${getRelationField(resource)}.${hotelField}`]: { $in: assignedHotelIds }
      };
    }
  }

  return req.next ? req.next() : Promise.resolve();
};

// ======================
// Helper: Verify Single Item Access
// ======================
const verifyItemAccess = async (req, res, next, user, resource, resourceId, options) => {
  const { ownerField, hotelField, populatePath } = options;
  const { isGuest, isStaff, assignedHotelIds, userId } = user;

  // Get the model
  const Model = require('../models/')[getModelName(resource)];
  
  // Build query
  let query = Model.findOne({ 
    _id: resourceId, 
    deletedAt: null 
  });

  // Populate if needed
  if (populatePath) {
    query = query.populate(populatePath);
  }

  const item = await query;

  if (!item) {
    return res.status(404).json({
      success: false,
      message: `${capitalize(resource)} not found`
    });
  }

  // Guests: Check ownership
  if (isGuest) {
    const itemOwnerId = ownerField ? item[ownerField]?.toString() : null;
    
    if (itemOwnerId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: `You can only access your own ${resource}s`
      });
    }
    
    return next();
  }

  // Staff: Check hotel assignment
  if (isStaff) {
    const itemHotelId = getNestedValue(item, populatePath || hotelField)?.toString();
    
    if (!itemHotelId || !assignedHotelIds.includes(itemHotelId)) {
      return res.status(403).json({
        success: false,
        message: `You do not have access to this ${resource}`
      });
    }
    
    return next();
  }

  return next();
};

// ======================
// Utility Functions
// ======================

// Map resource names to model names
const getModelName = (resource) => {
  const modelMap = {
    hotel: 'Hotel',
    room: 'Room',
    reservation: 'Reservation',
    billing: 'Billing',
    bill: 'Billing',
    housekeeping: 'Housekeeping',
    maintenance: 'Maintenance',
    service: 'AdditionalService',
    feedback: 'Feedback',
    notification: 'Notification',
    user: 'User',
    config: 'SystemConfig'
  };
  return modelMap[resource] || capitalize(resource);
};

// Map resource to relation field for nested queries
const getRelationField = (resource) => {
  const relationMap = {
    reservation: 'room',
    billing: 'reservation',
    housekeeping: 'room',
    maintenance: 'room',
    service: 'reservation',
    feedback: 'reservation'
  };
  return relationMap[resource] || 'hotel';
};

// Get nested value from object path
const getNestedValue = (obj, path) => {
  if (!path) return obj.hotel;
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

// Capitalize string
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// ======================
// Express Integration Helper
// ======================
// Use in controllers to apply access filters
const applyAccessFilters = (req, baseQuery = {}) => {
  return {
    ...baseQuery,
    ...(req.accessFilter || {})
  };
};

module.exports = {
  authenticate,
  authorize,
  applyAccessFilters
};

// ======================
// USAGE GUIDE
// ======================

/*
CONFIGURATION OPTIONS:
authorize({
  roles: [],           // Array of allowed roles (empty = all authenticated users)
  resource: null,      // Resource name: 'hotel', 'room', 'reservation', etc.
  ownerField: null,    // Field for ownership: 'guest', 'user', '_id'
  hotelField: 'hotel', // Field containing hotel reference (default: 'hotel')
  populatePath: null   // Nested path to hotel: 'room', 'room.hotel', 'reservation.room'
})

HOW IT WORKS:
- Admin: Always bypasses all checks
- Guest: Sees only their data (filtered by ownerField)
- Staff: Sees only data from assigned hotels (filtered by hotelField/populatePath)
- List operations: Adds req.accessFilter (use applyAccessFilters() in controller)
- Item operations: Pre-validates access before controller runs

EXAMPLES:
- Hotel routes: authorize({ roles: ['admin', 'manager'], resource: 'hotel' })
- Guest reservations: authorize({ roles: ['guest'], resource: 'reservation', ownerField: 'guest', populatePath: 'room' })
- User profile: authorize({ roles: ['guest'], resource: 'user', ownerField: '_id' })
*/

// ======================
// CONTROLLER USAGE
// ======================

/*
// List Controller Example
exports.list = async (req, res) => {
  const query = applyAccessFilters(req, req.query); // Apply access filters
  const items = await Model.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
};

// GetById Controller Example
exports.getById = async (req, res) => {
  const item = await Model.findOne({ _id: req.params.id, deletedAt: null });
  res.json({ success: true, data: item });
};
*/
