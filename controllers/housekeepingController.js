// ======================
// Housekeeping Controller
// ======================
const { Housekeeping, Room } = require('../models/');

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
    const { status, priority, assignedTo, room } = req.query;
    const filter = { deletedAt: null };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (room) filter.room = room;

    const tasks = await Housekeeping.find(filter)
      .populate('room', 'roomNumber roomType floor hotel')
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .sort({ priority: -1, scheduledTime: 1 });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
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
  createHousekeepingTask,
  getAllHousekeepingTasks,
  getHousekeepingTaskById,
  updateHousekeepingTask,
  startTask,
  completeTask
};