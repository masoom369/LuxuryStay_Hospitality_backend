// Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    description: String,
    amount: Number
  }],
  totalAmount: { type: Number, required: true },
  issuedAt: { type: Date, default: Date.now },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  deletedAt: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model('Invoice', invoiceSchema);
