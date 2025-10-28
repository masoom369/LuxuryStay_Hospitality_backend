// ======================
// Notification Controller
// ======================
const { Notification } = require('../models/');

const createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Notification creation failed',
      error: error.message
    });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const { isRead, type, priority } = req.query;
    const filter = {
      recipient: req.user.userId,
      deletedAt: null
    };

    if (isRead !== undefined) filter.isRead = isRead;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const notifications = await Notification.find(filter)
      .populate('hotel', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.userId,
        deletedAt: null
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
        deletedAt: null
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.userId,
        deletedAt: null
      },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Notification deletion failed',
      error: error.message
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};