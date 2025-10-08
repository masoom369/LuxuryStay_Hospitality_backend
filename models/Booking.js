// Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'confirmed'
  },
  totalAmount: { type: Number, required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
}, { timestamps: true });
