// ======================
// Billing Model
// ======================
const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (id) {
        const user = await mongoose.model('User').findById(id);
        return user && user.role === 'guest';
      },
      message: 'Billing guest must be a user with role "guest".'
    }
  },
  items: [{
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['room', 'food', 'laundry', 'minibar', 'spa', 'other']
    },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'online', 'cheque']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending'
  },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: Date,
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Billing', billingSchema);