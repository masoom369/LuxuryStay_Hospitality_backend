// Hotel.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  contact: {
    phone: String,
    email: String
  },
  amenities: [String], // e.g., ["Pool", "Spa", "Restaurant"]
  isActive: { type: Boolean, default: true }
}, { timestamps: true });