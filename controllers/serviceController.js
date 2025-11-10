// ======================
// Additional Service Controller
// ======================
const { AdditionalService } = require('../models/');
const { applyAccessFilters } = require('../middleware/auth');

const createServiceRequest = async (req, res) => {
  try {
    const serviceData = req.body;

    // If guest is creating request, set guest from token
    if (req.user.role === 'guest') {
      serviceData.guest = req.user.userId;
    }

    const service = new AdditionalService(serviceData);
    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Service request creation failed',
      error: error.message
    });
  }
};

const getAllServiceRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, serviceType, guest, reservation, assignedTo } = req.query;
    const filters = { deletedAt: null };

    if (status) filters.status = status;
    if (serviceType) filters.serviceType = serviceType;
    if (guest) filters.guest = guest;
    if (reservation) filters.reservation = reservation;
    if (assignedTo) filters.assignedTo = assignedTo;

    // Apply access filters automatically
    const query = applyAccessFilters(req, filters, 'service');

    const services = await AdditionalService.find(query)
      .populate('guest', 'username email')
      .populate('reservation', 'room')
      .populate('assignedTo', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ requestedTime: 1 });

    const total = await AdditionalService.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests',
      error: error.message
    });
  }
};

const getServiceRequestById = async (req, res) => {
  try {
    // Access already verified by authorize middleware
    const service = await AdditionalService.findOne({
      _id: req.params.id,
      deletedAt: null
    })
      .populate('guest')
      .populate('reservation')
      .populate('assignedTo');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service request',
      error: error.message
    });
  }
};

const updateServiceRequest = async (req, res) => {
  try {
    const service = await AdditionalService.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.json({
      success: true,
      message: 'Service request updated successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Service request update failed',
      error: error.message
    });
  }
};

const assignService = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const service = await AdditionalService.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { assignedTo, status: 'confirmed' },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.json({
      success: true,
      message: 'Service assigned successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Service assignment failed',
      error: error.message
    });
  }
};

const completeService = async (req, res) => {
  try {
    const { notes, cost } = req.body;

    const service = await AdditionalService.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    service.status = 'completed';
    service.completedAt = new Date();
    if (notes) service.notes = notes;
    if (cost) service.cost = cost;
    await service.save();

    res.json({
      success: true,
      message: 'Service completed successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete service',
      error: error.message
    });
  }
};

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  assignService,
  completeService
};