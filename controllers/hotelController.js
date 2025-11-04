// ======================
// Hotel Controller
// ======================
const { Hotel } = require('../models/');
const { applyAccessFilters } = require('../middleware/auth');

const createHotel = async (req, res) => {
  try {
    const hotelData = { ...req.body };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      hotelData.images = req.files.map(file => file.filename);
    }

    const hotel = new Hotel(hotelData);
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
    const { page = 1, limit = 10, city, country, isActive } = req.query;
    const filters = { deletedAt: null };

    if (city) filters['location.city'] = city;
    if (country) filters['location.country'] = country;
    if (isActive !== undefined) filters.isActive = isActive;

    // Apply access filters automatically
    const query = applyAccessFilters(req, filters, 'hotel');

    const hotels = await Hotel.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: hotels,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
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
    // Access already verified by authorize middleware
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
    const updateData = { ...req.body };

    // Handle image uploads for updates
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      // If updating images, replace existing ones or append
      if (updateData.replaceImages) {
        updateData.images = newImages;
      } else {
        // Get existing hotel to append images
        const existingHotel = await Hotel.findOne({ _id: req.params.id, deletedAt: null });
        if (existingHotel) {
          updateData.images = [...(existingHotel.images || []), ...newImages];
        } else {
          updateData.images = newImages;
        }
      }
    }

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      updateData,
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