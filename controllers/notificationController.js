const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const sendNotificationEmail = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('user', 'email name');
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: notification.user.email,
      subject: 'Hotel Notification',
      text: notification.message
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Notification email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const triggerNotification = async (type, userId, message) => {
  try {
    await Notification.create({
      user: userId,
      message,
      type
    });
    // Optionally send email
  } catch (err) {
    console.error('Error triggering notification:', err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
  sendNotificationEmail,
  triggerNotification
};
