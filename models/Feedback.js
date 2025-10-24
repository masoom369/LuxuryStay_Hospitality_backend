// Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  deletedAt: { type: Date }
});
module.exports = mongoose.model('Feedback', feedbackSchema);