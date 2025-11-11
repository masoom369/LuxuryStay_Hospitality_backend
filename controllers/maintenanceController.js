// ======================
// Maintenance Controller
// ======================
const { Maintenance, Room, User } = require('../models/');
const { applyAccessFilters } = require('../middleware/auth');

// Get maintenance statistics for dashboard
const getMaintenanceStats = async (req, res) => {
  try {
    const totalIssues = await Maintenance.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId // Filter for current user
    });

    const reportedIssues = await Maintenance.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId,
      status: 'reported'
    });

    const assignedIssues = await Maintenance.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId,
      status: 'assigned'
    });

    const inProgressIssues = await Maintenance.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId,
      status: 'in-progress'
    });

    const completedIssues = await Maintenance.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId,
      status: 'completed'
    });

    const stats = {
      totalIssues,
      reportedIssues,
      assignedIssues,
      inProgressIssues,
      completedIssues,
      completionRate: totalIssues ? Math.round((completedIssues / totalIssues) * 100) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance stats',
      error: error.message
    });
  }
};

// Get maintenance schedule
const getMaintenanceSchedule = async (req, res) => {
  try {
    const { date } = req.query;

    const filters = {
      deletedAt: null,
      assignedTo: req.user.userId
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filters.createdAt = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    const issues = await Maintenance.find(filters)
      .populate('room', 'roomNumber roomType floor')
      .populate('reportedBy', 'username');

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance schedule',
      error: error.message
    });
  }
};

// Get maintenance trends
const getMaintenanceTrends = async (req, res) => {
  try {
    // In a real application, this would aggregate data by date periods
    // For now, we'll return mock data similar to the frontend component
    const trends = [
      { day: 'Mon', completed: 3 },
      { day: 'Tue', completed: 5 },
      { day: 'Wed', completed: 2 },
      { day: 'Thu', completed: 7 },
      { day: 'Fri', completed: 4 },
      { day: 'Sat', completed: 6 },
      { day: 'Sun', completed: 8 },
    ];

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance trends',
      error: error.message
    });
  }
};

// Search maintenance issues
const searchMaintenanceIssues = async (req, res) => {
  try {
    const { q: query, status, priority, roomNumber, issueType } = req.query;

    if (!query && !status && !priority && !roomNumber && !issueType) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter q is required when no other filters are provided'
      });
    }

    const filters = { deletedAt: null, assignedTo: req.user.userId };

    if (query) {
      filters.$or = [
        { 'room.roomNumber': { $regex: query, $options: 'i' } },
        { 'description': { $regex: query, $options: 'i' } },
        { 'issueType': { $regex: query, $options: 'i' } }
      ];
    }

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (roomNumber) filters['room.roomNumber'] = roomNumber;
    if (issueType) filters.issueType = issueType;

    const issues = await Maintenance.find(filters)
      .populate('room', 'roomNumber roomType floor')
      .populate('reportedBy', 'username');

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search maintenance issues',
      error: error.message
    });
  }
};

const createMaintenanceRequest = async (req, res) => {
  try {
    const requestData = req.body;

    // Generate ticket number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    requestData.ticketNumber = `MTK${timestamp}${random}`;

    requestData.reportedBy = req.user.userId;

    const request = new Maintenance(requestData);
    await request.save();

    // Update room status if urgent
    if (requestData.priority === 'urgent') {
      const room = await Room.findById(requestData.room);
      if (room) {
        room.status = 'maintenance';
        await room.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Request creation failed',
      error: error.message
    });
  }
};

const getAllMaintenanceRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, issueType, assignedTo, room } = req.query;
    const filters = { deletedAt: null };

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (issueType) filters.issueType = issueType;
    if (assignedTo) filters.assignedTo = assignedTo;
    if (room) filters.room = room;

    // Apply access filters automatically
    const query = applyAccessFilters(req, filters, 'maintenance');

    const requests = await Maintenance.find(query)
      .populate('room', 'roomNumber roomType floor hotel')
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ priority: -1, createdAt: -1 });

    const total = await Maintenance.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance requests',
      error: error.message
    });
  }
};

const getMaintenanceRequestById = async (req, res) => {
  try {
    // Access already verified by authorize middleware
    const request = await Maintenance.findOne({
      _id: req.params.id,
      deletedAt: null
    })
      .populate('room')
      .populate('reportedBy')
      .populate('assignedTo');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request',
      error: error.message
    });
  }
};

const updateMaintenanceRequest = async (req, res) => {
  try {
    const request = await Maintenance.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance request updated successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Request update failed',
      error: error.message
    });
  }
};

const assignMaintenance = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const request = await Maintenance.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { assignedTo, status: 'assigned' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance assigned successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Assignment failed',
      error: error.message
    });
  }
};

const completeMaintenanceRequest = async (req, res) => {
  try {
    const { actualCost, notes } = req.body;

    const request = await Maintenance.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    request.status = 'completed';
    if (actualCost) request.actualCost = actualCost;
    if (notes) request.notes = notes;
    await request.save();

    // Update room status back to available or cleaning
    const room = await Room.findById(request.room);
    if (room && room.status === 'maintenance') {
      room.status = 'cleaning';
      await room.save();
    }

    res.json({
      success: true,
      message: 'Maintenance completed successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete maintenance',
      error: error.message
    });
  }
};

module.exports = {
  getMaintenanceStats,
  getMaintenanceSchedule,
  getMaintenanceTrends,
  searchMaintenanceIssues,
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  assignMaintenance,
  completeMaintenanceRequest
};