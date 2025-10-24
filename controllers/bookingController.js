const Booking = require('../models/Booking');
const Room = require('../models/Room');

const createBooking = async (req, res) => {
  try {
    const { room, checkIn, checkOut, guest, hotel } = req.body;

    // Optional: Validate room availability
    const existing = await Booking.findOne({
      room,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } },
        { checkIn: { $gte: checkIn, $lt: checkOut } },
        { checkOut: { $gt: checkIn, $lte: checkOut } }
      ]
    });
    if (existing) return res.status(400).json({ success: false, message: 'Room not available for selected dates' });

    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ deletedAt: { $exists: false } })
      .populate('guest', 'name email')
      .populate('room', 'roomNumber type')
      .populate('hotel', 'name');
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const checkInBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking not eligible for check-in' });
    }

    // Update booking status
    booking.status = 'checked-in';
    await booking.save();

    // Update room status to occupied
    await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });

    // Simulate key issuance (in real app, integrate with key system)
    res.status(200).json({ success: true, message: 'Checked in successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email')
      .populate('room', 'roomNumber type')
      .populate('hotel', 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deactivateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, message: 'Booking soft deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, message: 'Booking permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const checkOutBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room guest hotel');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'checked-in') {
      return res.status(400).json({ success: false, message: 'Booking not eligible for check-out' });
    }

    // Update booking status
    booking.status = 'checked-out';
    await booking.save();

    // Update room status to cleaning
    await Room.findByIdAndUpdate(booking.room._id, { status: 'cleaning' });

    // Generate invoice (placeholder)
    const Invoice = require('../models/Invoice');
    const invoice = await Invoice.create({
      booking: booking._id,
      guest: booking.guest._id,
      hotel: booking.hotel._id,
      totalAmount: booking.totalAmount,
      items: [{ description: 'Room charges', amount: booking.totalAmount }]
    });

    res.status(200).json({ success: true, message: 'Checked out successfully', data: { booking, invoice } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deactivateBooking,
  deleteBooking,
  checkInBooking,
  checkOutBooking
};
