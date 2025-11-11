// ==========================================
// Reports Controller
// ==========================================

const { Reservation, Room, Billing, Feedback, User, Housekeeping, Maintenance } = require('../models/');
const { applyAccessFilters } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const exportReport = async (req, res) => {
  try {
    const { reportType, format, dateRange, options = {} } = req.body;
    
    // Validate required parameters
    if (!reportType || !format || !dateRange || !dateRange.start || !dateRange.end) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: reportType, format, and dateRange with start and end dates'
      });
    }
    
    // Apply access filters based on user permissions
    const roomFilters = { deletedAt: null, isActive: true };
    const roomQuery = applyAccessFilters(req, roomFilters, 'room');
    
    let reportData;
    
    switch (reportType) {
      case 'revenue':
        reportData = await generateRevenueReport(roomQuery, dateRange, options);
        break;
      case 'occupancy':
        reportData = await generateOccupancyReport(roomQuery, dateRange, options);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(roomQuery, dateRange, options);
        break;
      case 'feedback':
        reportData = await generateFeedbackReport(roomQuery, dateRange, options);
        break;
      case 'bookings':
        reportData = await generateBookingReport(roomQuery, dateRange, options);
        break;
      case 'guest':
        reportData = await generateGuestReport(roomQuery, dateRange, options);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported report type: ${reportType}`
        });
    }
    
    // Generate file based on format
    let filePath;
    let fileName;
    
    switch (format.toLowerCase()) {
      case 'pdf':
        fileName = `${reportType}_report_${dateRange.start}_${dateRange.end}.pdf`;
        filePath = await generatePDF(reportData, fileName);
        break;
      case 'xls':
        fileName = `${reportType}_report_${dateRange.start}_${dateRange.end}.xlsx`;
        filePath = await generateExcel(reportData, fileName);
        break;
      case 'csv':
        fileName = `${reportType}_report_${dateRange.start}_${dateRange.end}.csv`;
        filePath = await generateCSV(reportData, fileName);
        break;
      case 'png':
        fileName = `${reportType}_report_${dateRange.start}_${dateRange.end}.png`;
        filePath = await generateImage(reportData, fileName);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported format: ${format}`
        });
    }
    
    // Send file as response
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        // Clean up temp file if sending fails
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error('Error deleting temp file:', unlinkErr);
        }
        return res.status(500).json({
          success: false,
          message: 'Error sending report file'
        });
      }
      
      // Clean up temp file after sending
      setTimeout(() => {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }
      }, 10000); // Delete after 10 seconds to ensure file is sent
    });
    
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};

// Helper function to generate revenue report
async function generateRevenueReport(roomQuery, dateRange, options) {
  // Find rooms based on filters
  const rooms = await Room.find(roomQuery);
  const roomIds = rooms.map(r => r._id);
  
  // Get billing data for the date range
  const billingData = await Billing.find({
    deletedAt: null,
    createdAt: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    }
  })
  .populate('reservation')
  .populate('items');
  
  // Calculate revenue by source
  const revenueBySource = {};
  let totalRevenue = 0;
  
  billingData.forEach(billing => {
    billing.items.forEach(item => {
      if (!revenueBySource[item.category]) {
        revenueBySource[item.category] = 0;
      }
      revenueBySource[item.category] += item.totalPrice;
      totalRevenue += item.totalPrice;
    });
  });
  
  // Get revenue by room type
  const revenueByRoomType = {};
  const reservations = await Reservation.find({
    room: { $in: roomIds },
    checkInDate: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    },
    deletedAt: null
  })
  .populate('room');
  
  reservations.forEach(reservation => {
    const roomType = reservation.room.roomType;
    if (!revenueByRoomType[roomType]) {
      revenueByRoomType[roomType] = 0;
    }
    revenueByRoomType[roomType] += reservation.totalAmount;
  });
  
  return {
    type: 'revenue',
    dateRange,
    totalRevenue,
    revenueBySource,
    revenueByRoomType,
    additionalOptions: options
  };
}

// Helper function to generate occupancy report
async function generateOccupancyReport(roomQuery, dateRange, options) {
  const rooms = await Room.find(roomQuery);
  const totalRooms = rooms.length;
  
  // Calculate daily occupancy for the date range
  const dateRangeArray = [];
  let currentDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  while (currentDate <= endDate) {
    dateRangeArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const occupancyData = await Promise.all(
    dateRangeArray.map(async (date) => {
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
  
  // Group by floor if needed
  const occupancyByFloor = {};
  rooms.forEach(room => {
    if (!occupancyByFloor[room.floor]) {
      occupancyByFloor[room.floor] = { total: 0, occupied: 0 };
    }
    occupancyByFloor[room.floor].total++;
  });
  
  // Tally occupied rooms by floor
  for (const day of occupancyData) {
    const dayReservations = await Reservation.find({
      room: { $in: rooms.map(r => r._id) },
      status: { $in: ['confirmed', 'checked-in'] },
      checkInDate: { $lte: new Date(day.date) },
      checkOutDate: { $gt: new Date(day.date) },
      deletedAt: null
    }).populate('room');
    
    dayReservations.forEach(reservation => {
      const floor = reservation.room.floor;
      if (occupancyByFloor[floor]) {
        occupancyByFloor[floor].occupied++;
      }
    });
  }
  
  return {
    type: 'occupancy',
    dateRange,
    occupancyData,
    occupancyByFloor,
    additionalOptions: options
  };
}

// Helper function to generate performance report
async function generatePerformanceReport(roomQuery, dateRange, options) {
  // Get room data
  const rooms = await Room.find(roomQuery);
  const roomIds = rooms.map(r => r._id);
  
  // Get reservation data for the period
  const reservations = await Reservation.find({
    room: { $in: roomIds },
    checkInDate: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    },
    deletedAt: null
  });
  
  // Calculate various KPIs
  const totalReservations = reservations.length;
  const totalNights = reservations.reduce((sum, res) => {
    const nights = Math.ceil((res.checkOutDate - res.checkInDate) / (1000 * 60 * 60 * 24));
    return sum + nights;
  }, 0);
  
  // Calculate occupancy
  const occupiedNights = reservations.reduce((sum, res) => {
    const nights = Math.ceil((res.checkOutDate - res.checkInDate) / (1000 * 60 * 60 * 24));
    return sum + nights;
  }, 0);
  const availableNights = totalRooms * (Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)));
  const occupancyRate = availableNights > 0 ? (occupiedNights / availableNights * 100) : 0;
  
  // Calculate revenue
  const revenue = reservations.reduce((sum, res) => sum + res.totalAmount, 0);
  const avgDailyRate = totalReservations > 0 ? revenue / totalReservations : 0;
  const revPar = availableNights > 0 ? revenue / availableNights : 0;
  
  // Get guest feedback for the period
  const feedbacks = await Feedback.find({
    createdAt: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    },
    deletedAt: null
  });
  
  const avgRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
    : 0;
  
  // Staff performance
  const housekeepingTasks = await Housekeeping.find({
    createdAt: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    },
    deletedAt: null
  });
  
  const maintenanceTasks = await Maintenance.find({
    createdAt: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    },
    deletedAt: null
  });
  
  return {
    type: 'performance',
    dateRange,
    kpis: {
      totalRooms,
      totalReservations,
      totalNights,
      occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      avgDailyRate: parseFloat(avgDailyRate.toFixed(2)),
      revPar: parseFloat(revPar.toFixed(2)),
      avgRating: parseFloat(avgRating.toFixed(2))
    },
    staffPerformance: {
      housekeeping: {
        completedTasks: housekeepingTasks.filter(t => t.status === 'completed').length,
        totalTasks: housekeepingTasks.length
      },
      maintenance: {
        completedTasks: maintenanceTasks.filter(t => t.status === 'completed').length,
        totalTasks: maintenanceTasks.length
      }
    },
    additionalOptions: options
  };
}

// Helper function to generate feedback report
async function generateFeedbackReport(roomQuery, dateRange, options) {
  const feedbacks = await Feedback.find({
    createdAt: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    },
    deletedAt: null
  })
  .populate('guest')
  .populate('reservation');
  
  // Calculate statistics
  const totalFeedback = feedbacks.length;
  const avgRating = totalFeedback > 0 
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedback 
    : 0;
  
  // Rating distribution
  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };
  
  feedbacks.forEach(feedback => {
    ratingDistribution[feedback.rating]++;
  });
  
  // Category averages
  const categoryAverages = {
    cleanliness: 0,
    staff: 0,
    facilities: 0,
    valueForMoney: 0,
    location: 0
  };
  
  if (totalFeedback > 0) {
    categoryAverages.cleanliness = feedbacks.reduce((sum, f) => sum + f.categories?.cleanliness, 0) / totalFeedback;
    categoryAverages.staff = feedbacks.reduce((sum, f) => sum + f.categories?.staff, 0) / totalFeedback;
    categoryAverages.facilities = feedbacks.reduce((sum, f) => sum + f.categories?.facilities, 0) / totalFeedback;
    categoryAverages.valueForMoney = feedbacks.reduce((sum, f) => sum + f.categories?.valueForMoney, 0) / totalFeedback;
    categoryAverages.location = feedbacks.reduce((sum, f) => sum + f.categories?.location, 0) / totalFeedback;
  }
  
  // Positive vs negative feedback
  const positiveFeedback = feedbacks.filter(f => f.rating >= 4).length;
  const negativeFeedback = feedbacks.filter(f => f.rating <= 2).length;
  
  return {
    type: 'feedback',
    dateRange,
    stats: {
      totalFeedback,
      avgRating: parseFloat(avgRating.toFixed(2)),
      positiveFeedback,
      negativeFeedback,
      ratingDistribution,
      categoryAverages: {
        cleanliness: parseFloat(categoryAverages.cleanliness.toFixed(2)),
        staff: parseFloat(categoryAverages.staff.toFixed(2)),
        facilities: parseFloat(categoryAverages.facilities.toFixed(2)),
        valueForMoney: parseFloat(categoryAverages.valueForMoney.toFixed(2)),
        location: parseFloat(categoryAverages.location.toFixed(2))
      }
    },
    feedbacks: feedbacks,
    additionalOptions: options
  };
}

// Helper function to generate booking report
async function generateBookingReport(roomQuery, dateRange, options) {
  const rooms = await Room.find(roomQuery);
  const roomIds = rooms.map(r => r._id);
  
  const reservations = await Reservation.find({
    room: { $in: roomIds },
    checkInDate: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    },
    deletedAt: null
  })
  .populate('guest')
  .populate('room');
  
  // Bookings by source
  const bookingsBySource = {};
  reservations.forEach(reservation => {
    const source = reservation.bookingSource || 'other';
    if (!bookingsBySource[source]) {
      bookingsBySource[source] = 0;
    }
    bookingsBySource[source]++;
  });
  
  // Bookings by room type
  const bookingsByRoomType = {};
  reservations.forEach(reservation => {
    const roomType = reservation.room.roomType;
    if (!bookingsByRoomType[roomType]) {
      bookingsByRoomType[roomType] = 0;
    }
    bookingsByRoomType[roomType]++;
  });
  
  // Daily bookings
  const dateRangeArray = [];
  let currentDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  while (currentDate <= endDate) {
    dateRangeArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const dailyBookings = await Promise.all(
    dateRangeArray.map(async (date) => {
      const bookingsCount = await Reservation.countDocuments({
        room: { $in: roomIds },
        checkInDate: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        },
        deletedAt: null
      });
      
      return {
        date: date.toISOString().split('T')[0],
        bookings: bookingsCount
      };
    })
  );
  
  return {
    type: 'bookings',
    dateRange,
    stats: {
      totalBookings: reservations.length,
      bookingsBySource,
      bookingsByRoomType,
      dailyBookings
    },
    reservations,
    additionalOptions: options
  };
}

// Helper function to generate guest report
async function generateGuestReport(roomQuery, dateRange, options) {
  const rooms = await Room.find(roomQuery);
  const roomIds = rooms.map(r => r._id);
  
  const reservations = await Reservation.find({
    room: { $in: roomIds },
    checkInDate: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    },
    deletedAt: null
  })
  .populate('guest');
  
  // Get unique guests
  const uniqueGuests = [...new Set(reservations.map(res => res.guest._id.toString()))];
  
  // Guest demographics
  const guestDemographics = await User.aggregate([
    {
      $match: {
        _id: { $in: uniqueGuests.map(id => require('mongoose').Types.ObjectId(id)) },
        role: 'guest',
        deletedAt: null
      }
    },
    {
      $group: {
        _id: '$preferences.roomType',
        count: { $sum: 1 },
        avgLoyaltyPoints: { $avg: '$loyaltyPoints' },
        totalGuests: { $sum: 1 }
      }
    }
  ]);
  
  // Repeat guests
  const allGuestReservations = await Reservation.find({
    guest: { $in: uniqueGuests.map(id => require('mongoose').Types.ObjectId(id)) },
    deletedAt: null
  });
  
  const repeatGuests = allGuestReservations.reduce((acc, res) => {
    if (!acc[res.guest.toString()]) {
      acc[res.guest.toString()] = 0;
    }
    acc[res.guest.toString()]++;
    return acc;
  }, {});
  
  const repeatGuestCount = Object.values(repeatGuests).filter(count => count > 1).length;
  
  return {
    type: 'guest',
    dateRange,
    stats: {
      totalGuests: uniqueGuests.length,
      totalStays: reservations.length,
      repeatGuests: repeatGuestCount,
      guestDemographics
    },
    additionalOptions: options
  };
}

// Placeholder functions for generating different file formats
// In a real implementation, these would use libraries like pdf-lib for PDF,
// excel4node for Excel, etc.

async function generatePDF(reportData, fileName) {
  // This is a placeholder implementation
  // In a real application, you would use a library like pdf-lib or puppeteer
  const tempPath = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }
  
  const filePath = path.join(tempPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
  
  // For the purpose of this implementation, we're creating a text file
  // In a real app, you would generate a real PDF
  return filePath;
}

async function generateExcel(reportData, fileName) {
  // This is a placeholder implementation
  // In a real application, you would use a library like excel4node
  const tempPath = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }
  
  const filePath = path.join(tempPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
  
  // For the purpose of this implementation, we're creating a text file
  // In a real app, you would generate a real Excel file
  return filePath;
}

async function generateCSV(reportData, fileName) {
  // This is a placeholder implementation
  // In a real application, you would format data as CSV
  const tempPath = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }
  
  const filePath = path.join(tempPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
  
  // For the purpose of this implementation, we're creating a text file
  // In a real app, you would generate a real CSV file
  return filePath;
}

async function generateImage(reportData, fileName) {
  // This is a placeholder implementation
  // In a real application, you would convert report data to an image
  const tempPath = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }
  
  const filePath = path.join(tempPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
  
  // For the purpose of this implementation, we're creating a text file
  // In a real app, you would generate a real image file
  return filePath;
}

module.exports = {
  exportReport
};