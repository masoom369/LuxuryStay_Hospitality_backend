// MaintenanceRequest.js
const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: {
    type: String,
    enum: ['reported', 'in-progress', 'resolved'],
    default: 'reported'
  },
  resolvedAt: Date,
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
}, { timestamps: true });
