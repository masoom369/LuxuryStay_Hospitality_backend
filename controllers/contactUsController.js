const ContactUs = require('../models/ContactUs');

const createContactUs = async (req, res) => {
  try {
    const message = await ContactUs.create(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getAllContactUs = async (req, res) => {
  try {
    const messages = await ContactUs.find({ deletedAt: { $exists: false } });
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getContactUsById = async (req, res) => {
  try {
    const message = await ContactUs.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateContactUs = async (req, res) => {
  try {
    const message = await ContactUs.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deactivateContactUs = async (req, res) => {
  try {
    const message = await ContactUs.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, message: 'Message soft deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteContactUs = async (req, res) => {
  try {
    const message = await ContactUs.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, message: 'Message permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitContactForm = async (req, res) => {
  try {
    const message = await ContactUs.create(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const respondToMessage = async (req, res) => {
  try {
    const updated = await ContactUs.findByIdAndUpdate(
      req.params.id,
      {
        status: 'responded',
        response: req.body.response,
        respondedAt: new Date()
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createContactUs,
  getAllContactUs,
  getContactUsById,
  updateContactUs,
  deactivateContactUs,
  deleteContactUs,
  submitContactForm,
  respondToMessage
};
