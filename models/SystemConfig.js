// ======================
// SystemConfig Model (per-hotel or global)
// ======================
const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  category: {
    type: String,
    enum: ['pricing', 'policy', 'tax', 'notification', 'general']
  },
  description: String,
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    // optional: if null → global config
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: Date
}, { timestamps: true });
module.exports = mongoose.model('SystemConfig', systemConfigSchema);