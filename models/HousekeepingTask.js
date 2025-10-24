// HousekeepingTask.js
const mongoose = require('mongoose');

const housekeepingTaskSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // housekeeping staff
  taskType: {
    type: String,
    enum: ['cleaning', 'maintenance-report', 'inspection'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  notes: String,
  completedAt: Date,
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  deletedAt: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model('HousekeepingTask', housekeepingTaskSchema);
