const ServiceRequest = require('../models/ServiceRequest');

const requestService = async (req, res) => {
  try {
    const serviceReq = await ServiceRequest.create(req.body);
    res.status(201).json({ success: true, data: serviceReq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateServiceRequest = async (req, res) => {
  try {
    const updateData = req.body;
    if (req.body.status === 'completed') updateData.completedAt = new Date();

    const serviceReq = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!serviceReq) return res.status(404).json({ success: false, message: 'Service request not found' });
    res.status(200).json({ success: true, data: serviceReq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  requestService,
  updateServiceRequest
};
