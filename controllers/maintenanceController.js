// ======================
// Maintenance Controller
// ======================
const { Maintenance, Room } = require('../models/');

const createMaintenanceRequest = async (req, res) => {
  try {
    const requestData = req.body;

    // Generate ticket number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    requestData.ticketNumber = `MNT${timestamp}${random}`;

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
    const { status, priority, issueType, assignedTo, room } = req.query;
    const filter = { deletedAt: null };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (issueType) filter.issueType = issueType;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (room) filter.room = room;

    const requests = await Maintenance.find(filter)
      .populate('room', 'roomNumber roomType floor hotel')
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      data: requests,
      count: requests.length
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
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  assignMaintenance,
  completeMaintenanceRequest
};