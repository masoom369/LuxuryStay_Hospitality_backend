// ======================
// Feedback Controller
// ======================
const mongoose = require('mongoose');
const { Feedback, Reservation, Room } = require('../models/');
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
      .populate('reservation', 'checkInDate checkOutDate')
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

// Get feedback by room ID
const getFeedbackByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 100, status = 'published' } = req.query;

    // Get all reservations for the specified room
    const reservations = await Reservation.find({
      room: roomId,
      deletedAt: null
    }).select('_id');

    // Handle case where room has no reservations
    if (!reservations || reservations.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No reservations found for this room'
      });
    }

    // Extract reservation IDs
    const reservationIds = reservations.map(res => res._id);

    // Build filters for feedback
    const filters = {
      deletedAt: null,
      reservation: { $in: reservationIds }
    };

    // Handle status filter
    if (status === 'all') {
      filters.status = { $in: ['published', 'reviewed'] };
    } else {
      filters.status = status;
    }

    // Apply access filters automatically
    const query = applyAccessFilters(req, filters, 'feedback');

    const feedback = await Feedback.find(query)
      .populate('guest', 'username')
      .populate('reservation', 'checkInDate checkOutDate')
      .populate({
        path: 'reservation',
        populate: {
          path: 'room',
          select: 'roomNumber roomType'
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: feedback,
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

const getFeedbackByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 100, status = 'published' } = req.query;

    // First, get all rooms for the specified hotel
    const rooms = await Room.find({
      hotel: hotelId,
      deletedAt: null
    }).select('_id');

    // Extract room IDs
    const roomIds = rooms.map(room => room._id);

    // Handle case where hotel has no rooms
    if (!roomIds || roomIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No rooms found for this hotel'
      });
    }

    // Then get all reservations for those rooms
    const reservations = await Reservation.find({
      room: { $in: roomIds },
      deletedAt: null
    }).select('_id');

    // Extract reservation IDs
    const reservationIds = reservations.map(res => res._id);

    // Handle case where hotel has rooms but no reservations
    if (!reservationIds || reservationIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No reservations found for this hotel'
      });
    }

    // Build filters for feedback
    const filters = {
      deletedAt: null,
      reservation: { $in: reservationIds }
    };

    // Handle status filter
    if (status === 'all') {
      filters.status = { $in: ['published', 'reviewed'] };
    } else {
      filters.status = status;
    }
    // Fetch feedback
    const feedbacks = await Feedback.find(filters)
      .populate('guest', 'username email')
      .populate({
        path: 'reservation',
        select: 'room checkInDate checkOutDate',
        populate: {
          path: 'room',
          select: 'roomNumber roomType'
        }
      })
      .populate('response.respondedBy', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance

    // Get total count
    const total = await Feedback.countDocuments(filters);

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
  getFeedbackByHotelId,
  getFeedbackByRoomId
};