// ======================
// Hotel Model
// ======================
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    zipCode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    emergencyContact: String
  },
  amenities: [{
    type: String,
    enum: ['pool', 'spa', 'gym', 'restaurant', 'bar', 'conference_room', 'parking', 'wifi']
  }],
  isActive: { type: Boolean, default: true },
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Hotel', hotelSchema);