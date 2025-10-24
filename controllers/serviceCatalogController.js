const ServiceCatalog = require('../models/ServiceCatalog');

const createServiceCatalog = async (req, res) => {
  try {
    const service = await ServiceCatalog.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getAllServiceCatalogs = async (req, res) => {
  try {
    const services = await ServiceCatalog.find({ deletedAt: { $exists: false } })
      .populate('hotel', 'name');
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getServiceCatalogById = async (req, res) => {
  try {
    const service = await ServiceCatalog.findById(req.params.id)
      .populate('hotel', 'name');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateServiceCatalog = async (req, res) => {
  try {
    const service = await ServiceCatalog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deactivateServiceCatalog = async (req, res) => {
  try {
    const service = await ServiceCatalog.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, message: 'Service soft deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteServiceCatalog = async (req, res) => {
  try {
    const service = await ServiceCatalog.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, message: 'Service permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getServicesByHotel = async (req, res) => {
  try {
    const services = await ServiceCatalog.find({
      hotel: req.params.hotelId,
      isActive: true
    });
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createService = async (req, res) => {
  try {
    const service = await ServiceCatalog.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const services = await ServiceCatalog.find({
      category,
      isActive: true
    });
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createServiceCatalog,
  getAllServiceCatalogs,
  getServiceCatalogById,
  updateServiceCatalog,
  deactivateServiceCatalog,
  deleteServiceCatalog,
  getServicesByHotel,
  createService,
  getServicesByCategory
};
