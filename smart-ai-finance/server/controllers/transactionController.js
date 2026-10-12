const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const serializeDocument = require('../utils/serializeDocument');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.json(transactions.map(transaction => serializeDocument(transaction, { createdAt: 'created_at' })));
  } catch (error) {
    console.error('Fetching transactions failed:', error);
    res.status(500).json({ message: 'Unable to fetch transactions' });
  }
};

exports.addTransaction = async (req, res) => {
  const { name, amount, type, category, date } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || !Number.isFinite(Number(amount))
    || !['income', 'expense'].includes(type) || typeof category !== 'string' || !category.trim()
    || !date || Number.isNaN(Date.parse(date))) {
    return res.status(400).json({ message: 'A name, valid amount, type, category, and date are required' });
  }

  try {
    const transaction = await Transaction.create({
      user: req.user.id,
      name: name.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: new Date(date),
    });
    res.status(201).json(serializeDocument(transaction, { createdAt: 'created_at' }));
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid transaction data' });
    }
    console.error('Creating transaction failed:', error);
    res.status(500).json({ message: 'Unable to create transaction' });
  }
};

exports.deleteTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }

  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ id: transaction.id });
  } catch (error) {
    console.error('Deleting transaction failed:', error);
    res.status(500).json({ message: 'Unable to delete transaction' });
  }
};
