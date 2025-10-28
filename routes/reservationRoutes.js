// ==========================================
// routes/reservationRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createReservation, getAllReservations, getReservationById, updateReservation, checkIn, checkOut, cancelReservation } = require('../controllers/reservationController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateReservation, handleValidationErrors } = require('../middleware/validation');

router.use(authenticate);

router.post('/', authorize('admin', 'manager', 'receptionist'), validateReservation, handleValidationErrors, createReservation);
router.get('/', getAllReservations);
router.get('/:id', getReservationById);
router.put('/:id', authorize('admin', 'manager', 'receptionist'), updateReservation);
router.post('/:id/checkin', authorize('admin', 'manager', 'receptionist'), checkIn);
router.post('/:id/checkout', authorize('admin', 'manager', 'receptionist'), checkOut);
router.post('/:id/cancel', authorize('admin', 'manager', 'receptionist'), cancelReservation);

module.exports = router;