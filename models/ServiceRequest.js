// ServiceRequest.js
const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCatalog', required: true }, // links to catalog
  description: String,
  status: {
    type: String,
    enum: ['requested', 'in-progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  requestedAt: { type: Date, default: Date.now },
  completedAt: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // e.g., staff member
  notes: String
}, { timestamps: true });