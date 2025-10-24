// Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking', 'maintenance', 'housekeeping', 'system'] },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // e.g., bookingId, requestId
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  deletedAt: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);