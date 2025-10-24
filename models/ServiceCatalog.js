// ServiceCatalog.js
const mongoose = require('mongoose');

const serviceCatalogSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['room-service', 'laundry', 'transportation', 'spa', 'dining', 'other'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  estimatedCompletionTime: {
    type: Number, // in minutes
    default: 30
  },
  deletedAt: { type: Date }
}, { timestamps: true });

// Ensure unique service name per hotel
serviceCatalogSchema.index({ hotel: 1, name: 1 }, { unique: true });
module.exports = mongoose.model('ServiceCatalog', serviceCatalogSchema);
