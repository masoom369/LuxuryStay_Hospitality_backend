// ======================
// Feedback Model
// ======================
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
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
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  rating: { type: Number, min: 1, max: 5, required: true },
  categories: {
    cleanliness: { type: Number, min: 1, max: 5 },
    staff: { type: Number, min: 1, max: 5 },
    facilities: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 }
  },
  comment: String,
  isAnonymous: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'published'],
    default: 'pending'
  },
  response: {
    text: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date
  },
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('Feedback', feedbackSchema);