const ContactUs = require('../models/ContactUs');

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
  submitContactForm,
  respondToMessage
};
