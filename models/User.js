// ======================
// Unified User Model (Staff + Guests)
// ======================
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Common fields for all
  email: { type: String, required: true, unique: true, lowercase: true },

  // Authentication (required only for non-guests)
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  // Role determines behavior
  role: {
    type: String,
    enum: ['admin', 'subadmin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'],
    required: true
  },

  // Guest-specific fields
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  idType: { type: String, enum: ['passport', 'license', 'national_id'] },
  idNumber: String,
  preferences: {
    roomType: String,
    bedType: String,
    floor: String,
    smokingAllowed: Boolean,
    specialRequests: String
  },
  loyaltyPoints: { type: Number, default: 0 },
  totalStays: { type: Number, default: 0 },

  // Staff assignments (admin has no hotel; guest has none)
  assignments: [
    {
      hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: function () {
          return this.role !== 'admin' && this.role !== 'guest';
        }
      },
      assignedAt: { type: Date, default: Date.now }
    }
  ],

  resetPasswordToken: {
    type: String,
    select: false  // Don't return in queries by default
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },

  // Status
  isActive: { type: Boolean, default: true },
  deletedAt: Date
}, { timestamps: true });

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ 'assignments.hotel': 1 });
module.exports = mongoose.model('User', userSchema);