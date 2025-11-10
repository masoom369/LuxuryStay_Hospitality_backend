// ======================
// Reservation Model
// ======================
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (id) {
        const user = await mongoose.model('User').findById(id);
        return user && user.role === 'guest';
      },
      message: 'Guest must be a user with role "guest".'
    }
  },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  numberOfGuests: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  advancePayment: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  specialRequests: String,
  bookingSource: {
    type: String,
    enum: ['online', 'phone', 'walk-in', 'agent'],
    default: 'online'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Reservation', reservationSchema);