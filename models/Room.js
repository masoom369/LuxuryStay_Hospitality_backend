// Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  type: { type: String, enum: ['single', 'double', 'suite', 'deluxe'], required: true },
  pricePerNight: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'occupied', 'cleaning', 'maintenance'],
    default: 'available'
  },
  features: [String], // e.g., ["AC", "WiFi", "Balcony"]
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
}, { timestamps: true });

roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });
