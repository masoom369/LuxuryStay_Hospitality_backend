// ======================
// Feedback Controller
// ======================
const { Feedback } = require('../models/');

const createFeedback = async (req, res) => {
  try {
    const feedbackData = req.body;

    // If guest is creating feedback, set guest from token
    if (req.user.role === 'guest') {
      feedbackData.guest = req.user.userId;
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feedback submission failed',
      error: error.message
    });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const { status, guest, reservation, rating } = req.query;
    const filter = { deletedAt: null };

    if (status) filter.status = status;
    if (guest) filter.guest = guest;
    if (reservation) filter.reservation = reservation;
    if (rating) filter.rating = rating;

    const feedbacks = await Feedback.find(filter)
      .populate('guest', 'username email')
      .populate('reservation', 'reservationId checkInDate checkOutDate')
      .populate('response.respondedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks,
      count: feedbacks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      deletedAt: null
    })
      .populate('guest')
      .populate('reservation')
      .populate('response.respondedBy');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

const respondToFeedback = async (req, res) => {
  try {
    const { text } = req.body;

    const feedback = await Feedback.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      {
        'response.text': text,
        'response.respondedBy': req.user.userId,
        'response.respondedAt': new Date(),
        status: 'reviewed'
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to respond to feedback',
      error: error.message
    });
  }
};

const publishFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { status: 'published' },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback published successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to publish feedback',
      error: error.message
    });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  respondToFeedback,
  publishFeedback
};