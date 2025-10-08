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

module.exports = {
  createHotel,
  getAllHotels
};
