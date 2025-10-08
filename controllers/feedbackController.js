const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getFeedbackByHotel = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ hotel: req.params.hotelId })
      .populate('guest', 'name')
      .populate('booking', 'checkIn checkOut');
    res.status(200).json({ success: true, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackByHotel
};
