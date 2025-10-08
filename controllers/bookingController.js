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
        { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
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
    const bookings = await Booking.find()
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

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus
};
