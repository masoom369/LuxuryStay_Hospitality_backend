// User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  // ONLY for staff (managers, receptionists, housekeeping, etc.)
  // Guests typically have an EMPTY assignments array
  assignments: [{
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'receptionist', 'housekeeping'],
      required: true
    }
  }],
  contact: { type: String },
  address: { type: String },
  preferences: { type: String }, // e.g., "non-smoking", "high floor"
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });
