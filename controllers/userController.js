
// ======================
// User Management Controller
// ======================
const { User } = require('../models/');
const bcrypt = require('bcryptjs');
const { applyAccessFilters } = require('../middleware/auth');

const createUser = async (req, res) => {
    try {

        const userData = req.body;

        // Hash password if provided
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        const user = new User(userData);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'User creation failed',
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, isActive, hotel } = req.query;
        const filters = { deletedAt: null };

        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive;
        if (hotel) filters['assignments.hotel'] = hotel;

        // Apply access filters automatically
        const query = applyAccessFilters(req, filters, 'user');

        const users = await User.find(query)
            .populate('assignments.hotel', 'name location')
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

const getGuestStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('loyaltyPoints totalStays preferences');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                loyaltyPoints: user.loyaltyPoints,
                totalStays: user.totalStays,
                preferences: user.preferences
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch guest stats',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        // Access already verified by authorize middleware
        const user = await User.findOne({
            _id: req.params.id,
            deletedAt: null
        })
            .populate('assignments.hotel')
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

const updateGuestPreferences = async (req, res) => {
    try {
        const updates = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { preferences: updates.preferences || {} }, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Guest preferences updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Guest preferences update failed',
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const updates = req.body;

        // Prevent password update through this endpoint
        delete updates.password;

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, deletedAt: null },
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'User update failed',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, deletedAt: null },
            { deletedAt: new Date(), isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'User deletion failed',
            error: error.message
        });
    }
};

const assignHotel = async (req, res) => {
    try {
        const { userId, hotelId } = req.body;

        const user = await User.findOneAndUpdate(
            { _id: userId, deletedAt: null },
            {
                $push: {
                    assignments: {
                        hotel: hotelId,
                        assignedAt: new Date()
                    }
                }
            },
            { new: true }
        ).populate('assignments.hotel');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Hotel assigned successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hotel assignment failed',
            error: error.message
        });
    }
};
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    assignHotel,
    getGuestStats,
    updateGuestPreferences
};