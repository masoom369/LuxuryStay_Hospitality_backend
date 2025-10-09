const MaintenanceRequest = require('../models/MaintenanceRequest');
const Notification = require('../models/Notification');

const createRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const updateData = { status: req.body.status };
    if (req.body.status === 'resolved') updateData.resolvedAt = new Date();

    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('reportedBy room');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // Send notification on status update
    await Notification.create({
      user: request.reportedBy._id,
      message: `Your maintenance request for room ${request.room.roomNumber} has been updated to ${request.status}`,
      type: 'maintenance'
    });

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getRequestsByUser = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ reportedBy: req.params.userId })
      .populate('room', 'roomNumber type')
      .populate('hotel', 'name');
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRequestsByHotel = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ hotel: req.params.hotelId })
      .populate('reportedBy', 'name')
      .populate('room', 'roomNumber type');
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createRequest,
  updateRequestStatus,
  getRequestsByUser,
  getRequestsByHotel
};
