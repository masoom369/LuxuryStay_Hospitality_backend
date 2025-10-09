const HousekeepingTask = require('../models/HousekeepingTask');
const Room = require('../models/Room');
const MaintenanceRequest = require('../models/MaintenanceRequest');

const assignTask = async (req, res) => {
  try {
    const task = await HousekeepingTask.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const updateData = { status: req.body.status };
    if (req.body.status === 'completed') updateData.completedAt = new Date();

    const task = await HousekeepingTask.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getRoomsForHousekeeping = async (req, res) => {
  try {
    const { hotelId } = req.query;
    const query = { status: 'cleaning' };
    if (hotelId) query.hotel = hotelId;

    const rooms = await Room.find(query).populate('hotel', 'name');
    res.status(200).json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const scheduleTask = async (req, res) => {
  try {
    const { room, staff, scheduledAt, ...other } = req.body;
    const task = await HousekeepingTask.create({
      ...other,
      room,
      staff,
      scheduledAt,
      status: 'scheduled'
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const reportMaintenanceIssue = async (req, res) => {
  try {
    const { room, reportedBy, description, priority } = req.body;
    const request = await MaintenanceRequest.create({
      room,
      reportedBy,
      description,
      priority: priority || 'medium',
      status: 'pending'
    });
    res.status(201).json({ success: true, message: 'Maintenance issue reported', data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  assignTask,
  updateTaskStatus,
  getRoomsForHousekeeping,
  scheduleTask,
  reportMaintenanceIssue
};
