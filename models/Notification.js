// ======================
// Notification Model
// ======================
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['booking', 'maintenance', 'housekeeping', 'payment', 'system', 'alert'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: { type: Boolean, default: false },
  link: String,
  readAt: Date,
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
    // optional: if relevant to a specific hotel
  },
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);