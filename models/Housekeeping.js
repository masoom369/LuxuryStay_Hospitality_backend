// ======================
// Housekeeping Model
// ======================
const mongoose = require('mongoose');

const housekeepingSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (id) {
        const user = await mongoose.model('User').findById(id);
        return user && ['housekeeping', 'manager', 'admin'].includes(user.role);
      }
    }
  },
  taskType: {
    type: String,
    enum: ['routine_cleaning', 'deep_cleaning', 'checkout_cleaning', 'turndown_service'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'verified'],
    default: 'pending'
  },
  scheduledTime: { type: Date, required: true },
  startTime: Date,
  completionTime: Date,
  notes: String,
  issues: [{
    description: String,
    reportedAt: Date,
    resolved: { type: Boolean, default: false }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Housekeeping', housekeepingSchema);