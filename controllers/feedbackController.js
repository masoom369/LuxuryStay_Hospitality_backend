// ======================
// Feedback Controller
// ======================
const { Feedback, Reservation } = require('../models/');
const { applyAccessFilters } = require('../middleware/auth');

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
    const { page = 1, limit = 10, status, guest, reservation, rating } = req.query;
    const filters = { deletedAt: null };

    if (status) filters.status = status;
    if (guest) filters.guest = guest;
    if (reservation) filters.reservation = reservation;
    if (rating) filters.rating = rating;

    // Apply access filters automatically
    const query = applyAccessFilters(req, filters, 'feedback');

    const feedbacks = await Feedback.find(query)
      .populate('guest', 'username email')
      .populate('reservation', 'reservationId checkInDate checkOutDate')
      .populate('response.respondedBy', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
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
    // Access already verified by authorize middleware
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

const getFeedbackByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 10, status = 'published' } = req.query;
    
    // First, get all reservations for the specified hotel
    const reservationIds = await Reservation.find({ 
      hotel: hotelId,
      deletedAt: null 
    }).select('_id');
    
    // Extract IDs from the reservation documents
    const reservationObjectIds = reservationIds.map(res => res._id);
    
    // Only fetch feedback for those reservations
    const filters = {
      status: status === 'all' ? { $in: ['published', 'reviewed'] } : status,
      deletedAt: null,
      reservation: { $in: reservationObjectIds }
    };

    const feedbacks = await Feedback.find(filters)
      .populate('reservation', 'hotel checkInDate checkOutDate')  // Only populate reservation with necessary fields
      .populate('guest', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
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
  publishFeedback,
  getFeedbackByHotelId
};