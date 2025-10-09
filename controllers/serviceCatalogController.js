const ServiceCatalog = require('../models/ServiceCatalog');

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
  getServicesByHotel,
  createService,
  getServicesByCategory
};
