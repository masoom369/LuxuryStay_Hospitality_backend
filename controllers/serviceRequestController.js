const ServiceRequest = require('../models/ServiceRequest');

const createServiceRequest = async (req, res) => {
  try {
    const serviceReq = await ServiceRequest.create(req.body);
    res.status(201).json({ success: true, data: serviceReq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ deletedAt: { $exists: false } })
      .populate('guest', 'name')
      .populate('service', 'name')
      .populate('hotel', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('guest', 'name')
      .populate('service', 'name')
      .populate('hotel', 'name');
    if (!request) return res.status(404).json({ success: false, message: 'Service request not found' });
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateServiceRequest = async (req, res) => {
  try {
    const updateData = req.body;
    if (req.body.status === 'completed') updateData.completedAt = new Date();

    const serviceReq = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!serviceReq) return res.status(404).json({ success: false, message: 'Service request not found' });
    res.status(200).json({ success: true, data: serviceReq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deactivateServiceRequest = async (req, res) => {
  try {
    const serviceReq = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!serviceReq) return res.status(404).json({ success: false, message: 'Service request not found' });
    res.status(200).json({ success: true, message: 'Service request soft deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteServiceRequest = async (req, res) => {
  try {
    const serviceReq = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!serviceReq) return res.status(404).json({ success: false, message: 'Service request not found' });
    res.status(200).json({ success: true, message: 'Service request permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const requestService = async (req, res) => {
  try {
    const serviceReq = await ServiceRequest.create(req.body);
    res.status(201).json({ success: true, data: serviceReq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getServiceRequestsByUser = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ guest: req.params.userId })
      .populate('service', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getServiceRequestsByHotel = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ hotel: req.params.hotelId })
      .populate('guest', 'name')
      .populate('service', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deactivateServiceRequest,
  deleteServiceRequest,
  requestService,
  updateServiceRequest,
  getServiceRequestsByUser,
  getServiceRequestsByHotel
};
