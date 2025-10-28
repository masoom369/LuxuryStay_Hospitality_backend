// ======================
// Analytics & Reports Controller
// ======================
const { Room, Reservation, Billing, Housekeeping, Maintenance, Feedback, User } = require('../models/');


const getDashboardStats = async (req, res) => {
  try {
    const { hotel, startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Total rooms
    const totalRooms = await Room.countDocuments({
      hotel,
      deletedAt: null,
      isActive: true
    });

    // Occupied rooms
    const occupiedRooms = await Room.countDocuments({
      hotel,
      status: 'occupied',
      deletedAt: null
    });

    // Available rooms
    const availableRooms = await Room.countDocuments({
      hotel,
      status: 'available',
      deletedAt: null
    });

    // Occupancy rate
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(2) : 0;

    // Total reservations
    const reservationFilter = { deletedAt: null };
    if (hotel) {
      const hotelRooms = await Room.find({ hotel, deletedAt: null }).select('_id');
      reservationFilter.room = { $in: hotelRooms.map(r => r._id) };
    }
    if (Object.keys(dateFilter).length > 0) {
      reservationFilter.checkInDate = dateFilter;
    }

    const totalReservations = await Reservation.countDocuments(reservationFilter);
    const checkedInToday = await Reservation.countDocuments({
      ...reservationFilter,
      status: 'checked-in',
      checkInDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const checkingOutToday = await Reservation.countDocuments({
      ...reservationFilter,
      status: 'checked-in',
      checkOutDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // Revenue
    const revenueData = await Billing.aggregate([
      {
        $match: {
          deletedAt: null,
          paymentStatus: { $in: ['paid', 'partial'] },
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paidAmount' },
          pendingAmount: { $sum: '$balanceAmount' }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, pendingAmount: 0 };

    // Pending tasks
    const pendingHousekeeping = await Housekeeping.countDocuments({
      status: { $in: ['pending', 'in-progress'] },
      deletedAt: null
    });

    const pendingMaintenance = await Maintenance.countDocuments({
      status: { $in: ['reported', 'assigned', 'in-progress'] },
      deletedAt: null
    });

    // Guest satisfaction
    const feedbackStats = await Feedback.aggregate([
      {
        $match: {
          deletedAt: null,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 }
        }
      }
    ]);

    const feedback = feedbackStats[0] || { averageRating: 0, totalFeedback: 0 };

    res.json({
      success: true,
      data: {
        rooms: {
          total: totalRooms,
          occupied: occupiedRooms,
          available: availableRooms,
          occupancyRate: parseFloat(occupancyRate)
        },
        reservations: {
          total: totalReservations,
          checkedInToday,
          checkingOutToday
        },
        revenue: {
          total: revenue.totalRevenue,
          pending: revenue.pendingAmount
        },
        tasks: {
          pendingHousekeeping,
          pendingMaintenance
        },
        feedback: {
          averageRating: feedback.averageRating ? feedback.averageRating.toFixed(1) : 0,
          totalFeedback: feedback.totalFeedback
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

const getOccupancyReport = async (req, res) => {
  try {
    const { hotel, startDate, endDate } = req.query;

    const rooms = await Room.find({
      hotel,
      deletedAt: null,
      isActive: true
    });

    const totalRooms = rooms.length;

    const dateRange = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const occupancyData = await Promise.all(
      dateRange.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const occupiedCount = await Reservation.countDocuments({
          room: { $in: rooms.map(r => r._id) },
          status: { $in: ['confirmed', 'checked-in'] },
          checkInDate: { $lte: date },
          checkOutDate: { $gt: date },
          deletedAt: null
        });

        return {
          date: date.toISOString().split('T')[0],
          occupiedRooms: occupiedCount,
          totalRooms,
          occupancyRate: totalRooms > 0 ? ((occupiedCount / totalRooms) * 100).toFixed(2) : 0
        };
      })
    );

    res.json({
      success: true,
      data: occupancyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate occupancy report',
      error: error.message
    });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const { hotel, startDate, endDate, groupBy = 'day' } = req.query;

    let groupByFormat;
    switch (groupBy) {
      case 'month':
        groupByFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'year':
        groupByFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
        break;
      default:
        groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const revenueData = await Billing.aggregate([
      {
        $match: {
          deletedAt: null,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: groupByFormat,
          totalRevenue: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          pendingAmount: { $sum: '$balanceAmount' },
          billCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by category
    const categoryRevenue = await Billing.aggregate([
      {
        $match: {
          deletedAt: null,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          revenue: { $sum: '$items.totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        timeline: revenueData,
        byCategory: categoryRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate revenue report',
      error: error.message
    });
  }
};

const getGuestReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Top guests by stays
    const topGuests = await Reservation.aggregate([
      {
        $match: {
          deletedAt: null,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$guest',
          totalStays: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalStays: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'guestInfo'
        }
      },
      { $unwind: '$guestInfo' }
    ]);

    // Guest demographics
    const guestStats = await User.aggregate([
      {
        $match: {
          role: 'guest',
          deletedAt: null
        }
      },
      {
        $group: {
          _id: null,
          totalGuests: { $sum: 1 },
          averageLoyaltyPoints: { $avg: '$loyaltyPoints' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        topGuests,
        stats: guestStats[0] || { totalGuests: 0, averageLoyaltyPoints: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate guest report',
      error: error.message
    });
  }
};

const getStaffPerformanceReport = async (req, res) => {
  try {
    const { startDate, endDate, hotel } = req.query;

    // Housekeeping performance
    const housekeepingPerformance = await Housekeeping.aggregate([
      {
        $match: {
          deletedAt: null,
          completionTime: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          tasksCompleted: { $sum: 1 },
          averageCompletionTime: {
            $avg: {
              $subtract: ['$completionTime', '$startTime']
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staffInfo'
        }
      },
      { $unwind: '$staffInfo' },
      { $sort: { tasksCompleted: -1 } }
    ]);

    // Maintenance performance
    const maintenancePerformance = await Maintenance.aggregate([
      {
        $match: {
          deletedAt: null,
          status: 'completed',
          updatedAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          tasksCompleted: { $sum: 1 },
          totalCost: { $sum: '$actualCost' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staffInfo'
        }
      },
      { $unwind: '$staffInfo' },
      { $sort: { tasksCompleted: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        housekeeping: housekeepingPerformance,
        maintenance: maintenancePerformance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate staff performance report',
      error: error.message
    });
  }
};

const getFeedbackAnalytics = async (req, res) => {
  try {
    const { hotel, startDate, endDate } = req.query;

    const feedbackAnalytics = await Feedback.aggregate([
      {
        $match: {
          deletedAt: null,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          averageCleanliness: { $avg: '$categories.cleanliness' },
          averageStaff: { $avg: '$categories.staff' },
          averageFacilities: { $avg: '$categories.facilities' },
          averageValueForMoney: { $avg: '$categories.valueForMoney' },
          averageLocation: { $avg: '$categories.location' },
          totalFeedback: { $sum: 1 },
          fiveStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
          },
          fourStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] }
          },
          threeStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
          },
          twoStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] }
          },
          oneStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: feedbackAnalytics[0] || {
        averageRating: 0,
        totalFeedback: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate feedback analytics',
      error: error.message
    });
  }
};
module.exports = {
  getDashboardStats,
  getOccupancyReport,
  getRevenueReport,
  getGuestReport,
  getStaffPerformanceReport,
  getFeedbackAnalytics
};