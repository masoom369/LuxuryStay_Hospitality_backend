// ======================
// Maintenance Model
// ======================
const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  issueType: {
    type: String,
    enum: ['plumbing', 'electrical', 'hvac', 'furniture', 'appliance', 'other'],
    required: true
  },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'assigned', 'in-progress', 'completed', 'verified'],
    default: 'reported'
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimatedCost: Number,
  actualCost: Number,
  notes: String,
  images: [String],
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Maintenance', maintenanceSchema);