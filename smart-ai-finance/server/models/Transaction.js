const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ['income', 'expense'] },
  category: { type: String, required: true },
  date: { type: Date, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);
