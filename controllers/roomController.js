const Room = require('../models/Room');

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('hotel', 'name');
    res.status(200).json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'name');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom
};
