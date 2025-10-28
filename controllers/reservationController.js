// ======================
// Reservation Controller
// ======================
const { Reservation, Room, User, Housekeeping } = require('../models/');

const createReservation = async (req, res) => {
  try {
    const reservationData = req.body;

    // Generate unique reservation ID
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    reservationData.reservationId = `RES${timestamp}${random}`;

    // Verify room availability
    const room = await Room.findById(reservationData.room);
    if (!room || room.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available'
      });
    }

    // Check for overlapping reservations
    const overlapping = await Reservation.findOne({
      room: reservationData.room,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        {
          checkInDate: { $lte: reservationData.checkOutDate },
          checkOutDate: { $gte: reservationData.checkInDate }
        }
      ]
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for the selected dates'
      });
    }

    // Calculate total amount
    const days = Math.ceil(
      (new Date(reservationData.checkOutDate) - new Date(reservationData.checkInDate))
      / (1000 * 60 * 60 * 24)
    );
    reservationData.totalAmount = room.basePrice * days;

    // Set created by
    reservationData.createdBy = req.user.userId;

    const reservation = new Reservation(reservationData);
    await reservation.save();

    // Update room status to reserved
    room.status = 'reserved';
    await room.save();

    // Update guest stats if guest
    const guest = await User.findById(reservationData.guest);
    if (guest && guest.role === 'guest') {
      guest.totalStays += 1;
      guest.loyaltyPoints += Math.floor(reservationData.totalAmount / 100);
      await guest.save();
    }

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Reservation creation failed',
      error: error.message
    });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const { status, guest, room, checkInDate, checkOutDate } = req.query;
    const filter = { deletedAt: null };

    if (status) filter.status = status;
    if (guest) filter.guest = guest;
    if (room) filter.room = room;
    if (checkInDate) filter.checkInDate = { $gte: new Date(checkInDate) };
    if (checkOutDate) filter.checkOutDate = { $lte: new Date(checkOutDate) };

    const reservations = await Reservation.find(filter)
      .populate('guest', 'username email')
      .populate('room', 'roomNumber roomType hotel')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
      error: error.message
    });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      deletedAt: null
    })
      .populate('guest')
      .populate('room')
      .populate('createdBy', 'username email');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservation',
      error: error.message
    });
  }
};

const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation updated successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Reservation update failed',
      error: error.message
    });
  }
};

const checkIn = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    if (reservation.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed reservations can be checked in'
      });
    }

    reservation.status = 'checked-in';
    await reservation.save();

    // Update room status
    const room = await Room.findById(reservation.room);
    if (room) {
      room.status = 'occupied';
      await room.save();
    }

    res.json({
      success: true,
      message: 'Check-in successful',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Check-in failed',
      error: error.message
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    if (reservation.status !== 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Guest is not checked in'
      });
    }

    reservation.status = 'checked-out';
    await reservation.save();

    // Update room status to cleaning
    const room = await Room.findById(reservation.room);
    if (room) {
      room.status = 'cleaning';
      await room.save();

      // Create housekeeping task
      const cleaningTask = new Housekeeping({
        room: room._id,
        assignedTo: req.body.housekeepingStaffId || req.user.userId,
        taskType: 'checkout_cleaning',
        priority: 'high',
        scheduledTime: new Date(),
        createdBy: req.user.userId
      });
      await cleaningTask.save();
    }

    res.json({
      success: true,
      message: 'Check-out successful',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Check-out failed',
      error: error.message
    });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    if (['checked-out', 'cancelled'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this reservation'
      });
    }

    reservation.status = 'cancelled';
    reservation.paymentStatus = 'refunded';
    await reservation.save();

    // Update room status
    const room = await Room.findById(reservation.room);
    if (room && room.status === 'reserved') {
      room.status = 'available';
      await room.save();
    }

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cancellation failed',
      error: error.message
    });
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  checkIn,
  checkOut,
  cancelReservation
};