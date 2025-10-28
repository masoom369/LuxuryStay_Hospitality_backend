// ======================
// Additional Service Controller
// ======================
const { AdditionalService } = require('../models/');

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
    const { status, serviceType, guest, reservation, assignedTo } = req.query;
    const filter = { deletedAt: null };

    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (guest) filter.guest = guest;
    if (reservation) filter.reservation = reservation;
    if (assignedTo) filter.assignedTo = assignedTo;

    const services = await AdditionalService.find(filter)
      .populate('guest', 'username email')
      .populate('reservation', 'reservationId room')
      .populate('assignedTo', 'username email')
      .sort({ requestedTime: 1 });

    res.json({
      success: true,
      data: services,
      count: services.length
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