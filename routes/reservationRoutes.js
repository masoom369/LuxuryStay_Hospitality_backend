// ==========================================
// routes/reservationRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const { createReservation, getAllReservations, getReservationById, updateReservation, checkIn, checkOut, cancelReservation, getGuestReservations, getGuestBookingHistory } = require('../controllers/reservationController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateReservation, handleValidationErrors } = require('../middleware/validation');

router.use(authenticate);

router.post('/', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'reservation', ownerField: 'guest', populatePath: 'room' }), validateReservation, handleValidationErrors, createReservation);
router.get('/', authorize({ roles: ['admin', 'manager', 'receptionist', 'guest'], resource: 'reservation', ownerField: 'guest', populatePath: 'room' }), getAllReservations);
router.get('/guest', authorize({ roles: ['guest'], resource: 'reservation', ownerField: '_id', populatePath: 'room' }), getGuestReservations);
router.get('/history', authorize({ roles: ['guest'], resource: 'reservation', ownerField: '_id', populatePath: 'room' }), getGuestBookingHistory);
router.get('/:id', authorize({ roles: ['admin', 'manager', 'receptionist', 'guest'], resource: 'reservation', ownerField: 'guest', populatePath: 'room' }), getReservationById);
router.put('/:id', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'reservation', ownerField: 'guest', populatePath: 'room' }), updateReservation);
router.post('/:id/checkin', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'reservation', ownerField: 'guest', populatePath: 'room' }), checkIn);
router.post('/:id/checkout', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'reservation', ownerField: 'guest', populatePath: 'room' }), checkOut);
router.post('/:id/cancel', authorize({ roles: ['admin', 'manager', 'receptionist'], resource: 'reservation', ownerField: 'guest', populatePath: 'room' }), cancelReservation);

module.exports = router;