// ======================
// System Config Controller
// ======================
const { SystemConfig } = require('../models/');

const createConfig = async (req, res) => {
  try {
    const configData = req.body;
    configData.updatedBy = req.user.userId;

    const config = new SystemConfig(configData);
    await config.save();

    res.status(201).json({
      success: true,
      message: 'Configuration created successfully',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Configuration creation failed',
      error: error.message
    });
  }
};

const getAllConfigs = async (req, res) => {
  try {
    const { category, hotel } = req.query;
    const filter = { deletedAt: null };

    if (category) filter.category = category;
    if (hotel) filter.hotel = hotel;

    const configs = await SystemConfig.find(filter)
      .populate('hotel', 'name')
      .populate('updatedBy', 'username email');

    res.json({
      success: true,
      data: configs,
      count: configs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configurations',
      error: error.message
    });
  }
};

const getConfigByKey = async (req, res) => {
  try {
    const config = await SystemConfig.findOne({
      key: req.params.key,
      deletedAt: null
    })
      .populate('hotel')
      .populate('updatedBy');

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration',
      error: error.message
    });
  }
};

const updateConfig = async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedBy = req.user.userId;

    const config = await SystemConfig.findOneAndUpdate(
      { key: req.params.key, deletedAt: null },
      updates,
      { new: true, runValidators: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Configuration update failed',
      error: error.message
    });
  }
};

const deleteConfig = async (req, res) => {
  try {
    const config = await SystemConfig.findOneAndUpdate(
      { key: req.params.key, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Configuration deletion failed',
      error: error.message
    });
  }
};

module.exports = {
  createConfig,
  getAllConfigs,
  getConfigByKey,
  updateConfig,
  deleteConfig
};