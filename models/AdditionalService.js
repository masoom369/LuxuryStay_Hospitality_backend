// ======================
// AdditionalService Model
// ======================
const mongoose = require('mongoose');

const additionalServiceSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (id) {
        const user = await mongoose.model('User').findById(id);
        return user && user.role === 'guest';
      }
    }
  },
  serviceType: {
    type: String,
    enum: ['room_service', 'laundry', 'wake_up_call', 'transportation', 'spa', 'tour', 'other'],
    required: true
  },
  description: String,
  requestedTime: Date,
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  cost: { type: Number, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  completedAt: Date,
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('AdditionalService', additionalServiceSchema);