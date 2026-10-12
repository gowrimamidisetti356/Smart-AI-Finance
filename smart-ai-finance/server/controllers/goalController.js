const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const serializeDocument = require('../utils/serializeDocument');

const goalAliases = {
  targetAmount: 'target_amount',
  currentAmount: 'current_amount',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ deadline: 1 });
    res.json(goals.map(goal => serializeDocument(goal, goalAliases)));
  } catch (error) {
    console.error('Fetching goals failed:', error);
    res.status(500).json({ message: 'Unable to fetch goals' });
  }
};

exports.addGoal = async (req, res) => {
  const { title, targetAmount, currentAmount, deadline } = req.body || {};
  if (typeof title !== 'string' || !title.trim() || !Number.isFinite(Number(targetAmount))
    || Number(targetAmount) <= 0 || (currentAmount !== undefined && !Number.isFinite(Number(currentAmount)))
    || !deadline || Number.isNaN(Date.parse(deadline))) {
    return res.status(400).json({ message: 'A title, positive target amount, and valid deadline are required' });
  }

  try {
    const goal = await Goal.create({
      userId: req.user.id,
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount === undefined ? 0 : Number(currentAmount),
      deadline: new Date(deadline),
    });
    res.status(201).json(serializeDocument(goal, goalAliases));
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid goal data' });
    }
    console.error('Creating goal failed:', error);
    res.status(500).json({ message: 'Unable to create goal' });
  }
};

exports.updateGoal = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid goal ID' });

  try {
    const goal = await Goal.findOne({ _id: id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const { title, targetAmount, currentAmount, deadline, status } = req.body || {};
    if ((title !== undefined && (typeof title !== 'string' || !title.trim()))
      || (targetAmount !== undefined && (!Number.isFinite(Number(targetAmount)) || Number(targetAmount) <= 0))
      || (currentAmount !== undefined && (!Number.isFinite(Number(currentAmount)) || Number(currentAmount) < 0))
      || (deadline !== undefined && Number.isNaN(Date.parse(deadline)))
      || (status !== undefined && !['active', 'completed'].includes(status))) {
      return res.status(400).json({ message: 'Invalid goal data' });
    }

    if (title !== undefined) goal.title = title.trim();
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (deadline !== undefined) goal.deadline = new Date(deadline);
    goal.status = goal.currentAmount >= goal.targetAmount ? 'completed' : (status || goal.status);

    await goal.save();
    res.json(serializeDocument(goal, goalAliases));
  } catch (error) {
    console.error('Updating goal failed:', error);
    res.status(500).json({ message: 'Unable to update goal' });
  }
};

exports.deleteGoal = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid goal ID' });

  try {
    const goal = await Goal.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ id: goal.id });
  } catch (error) {
    console.error('Deleting goal failed:', error);
    res.status(500).json({ message: 'Unable to delete goal' });
  }
};

exports.getGoalsProgress = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .select('title targetAmount currentAmount status');
    res.json(goals.map(goal => ({
      id: goal.id,
      title: goal.title,
      progressPercentage: goal.targetAmount > 0
        ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2)
        : 0,
      status: goal.status,
    })));
  } catch (error) {
    console.error('Fetching goal progress failed:', error);
    res.status(500).json({ message: 'Unable to fetch goal progress' });
  }
};
