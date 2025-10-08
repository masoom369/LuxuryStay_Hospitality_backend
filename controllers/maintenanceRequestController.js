const MaintenanceRequest = require('../models/MaintenanceRequest');

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
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createRequest,
  updateRequestStatus
};
