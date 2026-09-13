const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  status: { type: String, default: 'active', enum: ['active', 'completed'] },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
