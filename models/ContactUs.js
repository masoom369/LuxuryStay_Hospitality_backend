// ContactUs.js
const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'responded', 'closed'],
    default: 'pending'
  },
  respondedAt: Date,
  response: String
}, { timestamps: true });

module.exports = mongoose.model('ContactUs', contactUsSchema);
