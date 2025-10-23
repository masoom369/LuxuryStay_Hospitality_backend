const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Feedback = require('../models/Feedback');
const Room = require('../models/Room');

const getOccupancyRates = async (req, res) => {
  try {
    const { hotelId, startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalRooms = await Room.countDocuments({ hotel: hotelId });
    const occupiedBookings = await Booking.countDocuments({
      hotel: hotelId,
      status: { $in: ['confirmed', 'checked-in'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    const occupancyRate = (occupiedBookings / totalRooms) * 100;
    res.status(200).json({ success: true, data: { occupancyRate, totalRooms, occupiedBookings } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRevenueReports = async (req, res) => {
  try {
    const { hotelId, startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const invoices = await Invoice.find({
      hotel: hotelId,
      issuedAt: { $gte: start, $lte: end },
      paymentStatus: 'paid'
    });

    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    res.status(200).json({ success: true, data: { totalRevenue, invoicesCount: invoices.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFeedbackReports = async (req, res) => {
  try {
    const { hotelId } = req.query;
    const feedbacks = await Feedback.find({ hotel: hotelId }).populate('guest', 'name');
    const averageRating = feedbacks.length > 0 ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length : 0;
    res.status(200).json({ success: true, data: { feedbacks, averageRating } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { hotelId } = req.query;
    // Placeholder for forecasting and optimization analytics
    const bookings = await Booking.find({ hotel: hotelId });
    const trends = {
      totalBookings: bookings.length,
      averageStay: bookings.reduce((sum, b) => sum + (new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24), 0) / bookings.length
    };
    res.status(200).json({ success: true, data: trends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOccupancyRates,
  getRevenueReports,
  getFeedbackReports,
  getAnalytics
};
