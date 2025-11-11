// ======================
// Housekeeping Controller
// ======================
const { Housekeeping, Room, User } = require('../models/');
const { applyAccessFilters } = require('../middleware/auth');

const getHousekeepingStats = async (req, res) => {
  try {
    // Calculate housekeeping stats
    const totalTasks = await Housekeeping.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId // Only for the current user
    });

    const completedTasks = await Housekeeping.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId,
      status: 'completed'
    });

    const inProgressTasks = await Housekeeping.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId,
      status: 'in-progress'
    });

    const pendingTasks = await Housekeeping.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId,
      status: 'pending'
    });

    const todayTasks = await Housekeeping.countDocuments({
      deletedAt: null,
      assignedTo: req.user.userId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const stats = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      todayTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch housekeeping stats',
      error: error.message
    });
  }
};

const getHousekeepingSchedule = async (req, res) => {
  try {
    const { date } = req.query;

    const filters = {
      deletedAt: null,
      assignedTo: req.user.userId
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filters.scheduledTime = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    const tasks = await Housekeeping.find(filters)
      .populate('room', 'roomNumber roomType floor')
      .populate('assignedBy', 'username')
      .sort({ scheduledTime: 1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch housekeeping schedule',
      error: error.message
    });
  }
};

const searchHousekeepingTasks = async (req, res) => {
  try {
    const { q: query, status, priority, roomNumber } = req.query;

    if (!query && !status && !priority && !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter q is required when no other filters are provided'
      });
    }

    const filters = { deletedAt: null, assignedTo: req.user.userId };

    if (query) {
      filters.$or = [
        { 'room.roomNumber': { $regex: query, $options: 'i' } },
        { 'notes': { $regex: query, $options: 'i' } },
        { 'taskType': { $regex: query, $options: 'i' } }
      ];
    }

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (roomNumber) filters['room.roomNumber'] = roomNumber;

    const tasks = await Housekeeping.find(filters)
      .populate('room', 'roomNumber roomType floor')
      .populate('assignedBy', 'username');

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search housekeeping tasks',
      error: error.message
    });
  }
};

const createHousekeepingTask = async (req, res) => {
  try {
    const taskData = req.body;
    taskData.createdBy = req.user.userId;

    const task = new Housekeeping(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Housekeeping task created successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Task creation failed',
      error: error.message
    });
  }
};

const getAllHousekeepingTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, assignedTo, room } = req.query;
    const filters = { deletedAt: null };

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedTo) filters.assignedTo = assignedTo;
    if (room) filters.room = room;

    // Apply access filters automatically
    const query = applyAccessFilters(req, filters, 'housekeeping');

    const tasks = await Housekeeping.find(query)
      .populate('room', 'roomNumber roomType floor hotel')
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ priority: -1, scheduledTime: 1 });

    const total = await Housekeeping.countDocuments(query);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

const getHousekeepingTaskById = async (req, res) => {
  try {
    // Access already verified by authorize middleware
    const task = await Housekeeping.findOne({
      _id: req.params.id,
      deletedAt: null
    })
      .populate('room')
      .populate('assignedTo')
      .populate('createdBy');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

const updateHousekeepingTask = async (req, res) => {
  try {
    const task = await Housekeeping.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Task update failed',
      error: error.message
    });
  }
};

const startTask = async (req, res) => {
  try {
    const task = await Housekeeping.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = 'in-progress';
    task.startTime = new Date();
    await task.save();

    res.json({
      success: true,
      message: 'Task started',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start task',
      error: error.message
    });
  }
};

const completeTask = async (req, res) => {
  try {
    const { notes, issues } = req.body;

    const task = await Housekeeping.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = 'completed';
    task.completionTime = new Date();
    if (notes) task.notes = notes;
    if (issues) task.issues = issues;
    await task.save();

    // Update room status
    const room = await Room.findById(task.room);
    if (room && room.status === 'cleaning') {
      room.status = 'available';
      await room.save();
    }

    res.json({
      success: true,
      message: 'Task completed successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete task',
      error: error.message
    });
  }
};

module.exports = {
  getHousekeepingStats,
  getHousekeepingSchedule,
  searchHousekeepingTasks,
  createHousekeepingTask,
  getAllHousekeepingTasks,
  getHousekeepingTaskById,
  updateHousekeepingTask,
  startTask,
  completeTask
};