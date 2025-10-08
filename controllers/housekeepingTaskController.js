const HousekeepingTask = require('../models/HousekeepingTask');

const assignTask = async (req, res) => {
  try {
    const task = await HousekeepingTask.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const updateData = { status: req.body.status };
    if (req.body.status === 'completed') updateData.completedAt = new Date();

    const task = await HousekeepingTask.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  assignTask,
  updateTaskStatus
};
