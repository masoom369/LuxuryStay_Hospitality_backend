// ======================
// Contact Routes
// ======================
const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');

const router = express.Router();

// @desc    Create a new contact message (Public)
// @route   POST /contact
// @access  Public
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('subject').trim().isLength({ min: 2, max: 200 }).withMessage('Subject must be between 2 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number is too long')
], createContact);

// Apply authentication middleware for all routes below this line
router.use(authenticate);

// @desc    Get all contact messages
// @route   GET /contact
// @access  Private (Admin)
router.get('/', authorize({ roles: ['admin'], resource: 'contact' }), getContacts);

// @desc    Get a single contact message
// @route   GET /contact/:id
// @access  Private (Admin)
router.get('/:id', authorize({ roles: ['admin'], resource: 'contact' }), getContact);

// @desc    Update a contact message
// @route   PUT /contact/:id
// @access  Private (Admin)
router.put('/:id', authorize({ roles: ['admin'], resource: 'contact' }), [
  body('status').optional().isIn(['pending', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('response').optional().trim().isLength({ max: 1000 }).withMessage('Response is too long')
], updateContact);

// @desc    Delete a contact message
// @route   DELETE /contact/:id
// @access  Private (Admin)
router.delete('/:id', authorize({ roles: ['admin'], resource: 'contact' }), deleteContact);

module.exports = router;