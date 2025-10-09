const Hotel = require('../models/Hotel');

const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isActive: true });
    res.status(200).json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deactivateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.status(200).json({ success: true, message: 'Hotel deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateHotelSettings = async (req, res) => {
  try {
    // For system configuration, update hotel settings like rates, policies, taxes
    // Since model doesn't have these, assume req.body contains settings to update
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.status(200).json({ success: true, message: 'Hotel settings updated', data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  updateHotel,
  deactivateHotel,
  updateHotelSettings
};
