
// ==========================================
// middleware/validation.js
// ==========================================

const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username').trim().notEmpty().withMessage('First username is required'),
  body('password').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['admin', 'subadmin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'])
    .withMessage('Invalid role'),
];

// Hotel validation rules
const validateHotel = [
  body('name').trim().notEmpty().withMessage('Hotel name is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('contact.phone').notEmpty().withMessage('Contact phone is required'),
  body('contact.email').isEmail().withMessage('Valid contact email is required')
];

// Room validation rules
const validateRoom = [
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('roomType').isIn(['single', 'double', 'deluxe', 'suite', 'presidential'])
    .withMessage('Invalid room type'),
  body('hotel').isMongoId().withMessage('Valid hotel ID is required'),
  body('floor').isInt({ min: 0 }).withMessage('Floor must be a positive number'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('maxOccupancy').isInt({ min: 1 }).withMessage('Max occupancy must be at least 1')
];

// Reservation validation rules
const validateReservation = [
  body('guest').isMongoId().withMessage('Valid guest ID is required'),
  body('room').isMongoId().withMessage('Valid room ID is required'),
  body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOutDate').isISO8601().withMessage('Valid check-out date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('numberOfGuests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1')
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateHotel,
  validateRoom,
  validateReservation
};