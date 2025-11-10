// ======================
// Room Controller
// ======================
const { Room, Reservation } = require('../models/');
const { applyAccessFilters } = require('../middleware/auth');

const createRoom = async (req, res) => {
  try {
    const roomData = { ...req.body };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      roomData.images = req.files.map(file => file.filename);
    }

    const room = new Room(roomData);
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Room creation failed',
      error: error.message
    });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, hotel, roomType, status, floor } = req.query;
    const filters = { deletedAt: null };

    if (hotel) filters.hotel = hotel;
    if (roomType) filters.roomType = roomType;
    if (status) filters.status = status;
    if (floor) filters.floor = floor;

    // Apply access filters automatically
    const query = applyAccessFilters(req, filters, 'room');

    const rooms = await Room.find(query)
      .populate('hotel', 'name location')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ roomNumber: 1 });

    const total = await Room.countDocuments(query);

    res.json({
      success: true,
      data: rooms,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    // Access already verified by authorize middleware
    const room = await Room.findOne({
      _id: req.params.id,
      deletedAt: null
    }).populate('hotel');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
      error: error.message
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle image uploads for updates
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      // If updating images, replace existing ones or append
      if (updateData.replaceImages) {
        updateData.images = newImages;
      } else {
        // Get existing room to append images
        const existingRoom = await Room.findOne({ _id: req.params.id, deletedAt: null });
        if (existingRoom) {
          updateData.images = [...(existingRoom.images || []), ...newImages];
        } else {
          updateData.images = newImages;
        }
      }
    }

    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      updateData,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Room update failed',
      error: error.message
    });
  }
};

const updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { status },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room status updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Status update failed',
      error: error.message
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Room deletion failed',
      error: error.message
    });
  }
};

const getRoomByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 10, roomType, status } = req.query;
    
    const filters = {
      hotel: hotelId,
      deletedAt: null,
      isActive: true, // Only show active rooms to public
      status: { $ne: 'maintenance' } // Don't show rooms in maintenance to public
    };

    if (roomType) filters.roomType = roomType;
    if (status) filters.status = status;

    const rooms = await Room.find(filters)
      .populate('hotel', 'name location')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ roomNumber: 1 });

    const total = await Room.countDocuments(filters);

    res.json({
      success: true,
      data: rooms,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { hotel, checkInDate, checkOutDate } = req.query;

    const filter = {
      hotel,
      deletedAt: null,
      isActive: true,
      status: 'available',
    };

    // Get all available rooms for that hotel
    const availableRooms = await Room.find(filter);

    // Find overlapping reservations
    const overlappingReservations = await Reservation.find({
      room: { $in: availableRooms.map((r) => r._id) },
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkInDate) },
        },
      ],
    });

    const bookedRoomIds = overlappingReservations.map((r) => r.room.toString());

    // Exclude rooms already booked
    const actuallyAvailable = availableRooms.filter(
      (room) => !bookedRoomIds.includes(room._id.toString())
    );

    res.json({
      success: true,
      data: actuallyAvailable,
      count: actuallyAvailable.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Availability check failed',
      error: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getRoomByHotelId,
  checkAvailability
};