
// ======================
// User Management Controller
// ======================
const { User } = require('../models/');
const bcrypt = require('bcryptjs');

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
        const { role, isActive, hotel } = req.query;
        const filter = { deletedAt: null };

        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive;
        if (hotel) filter['assignments.hotel'] = hotel;

        const users = await User.find(filter)
            .populate('assignments.hotel', 'name location')
            .select('-password');

        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
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
    assignHotel
};