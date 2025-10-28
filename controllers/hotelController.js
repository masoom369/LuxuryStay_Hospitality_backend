// ======================
// Hotel Controller
// ======================
const { Hotel } = require('../models/');

const createHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hotel creation failed',
      error: error.message
    });
  }
};

const getAllHotels = async (req, res) => {
  try {
    const { city, country, isActive } = req.query;
    const filter = { deletedAt: null };

    if (city) filter['location.city'] = city;
    if (country) filter['location.country'] = country;
    if (isActive !== undefined) filter.isActive = isActive;

    const hotels = await Hotel.find(filter);

    res.json({
      success: true,
      data: hotels,
      count: hotels.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels',
      error: error.message
    });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel',
      error: error.message
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hotel update failed',
      error: error.message
    });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hotel deletion failed',
      error: error.message
    });
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel
};