const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  type: { type: String, required: true },
  bankName: { type: String, default: null },
  details: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
  balance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
