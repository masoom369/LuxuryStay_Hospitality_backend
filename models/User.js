const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'manager', 'receptionist', 'housekeeping', 'guest'],
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: function () {
      // Only require hotel if role is not 'admin' or 'guest'
      return this.role !== 'admin' && this.role !== 'guest';
    }
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  assignments: [assignmentSchema],
  contact: { type: String },
  address: { type: String },
  preferences: { type: String }, // e.g., "non-smoking", "high floor"
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  deletedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
