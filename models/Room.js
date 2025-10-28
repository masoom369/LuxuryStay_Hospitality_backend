// ======================
// Room Model (belongs to a Hotel)
// ======================
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  roomType: {
    type: String,
    enum: ['single', 'double', 'deluxe', 'suite', 'presidential'],
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  floor: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'occupied', 'cleaning', 'maintenance', 'reserved'],
    default: 'available'
  },
  basePrice: { type: Number, required: true },
  amenities: [{
    type: String,
    enum: ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'bathtub', 'safe', 'kitchen']
  }],
  bedType: { type: String, enum: ['single', 'double', 'queen', 'king'] },
  maxOccupancy: { type: Number, required: true },
  smokingAllowed: { type: Boolean, default: false },
  description: String,
  images: [String],
  isActive: { type: Boolean, default: true },
  deletedAt: Date
}, { timestamps: true });

// Ensure unique room number per hotel
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });
module.exports = mongoose.model('Room', roomSchema);