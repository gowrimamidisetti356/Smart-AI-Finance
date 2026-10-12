const mongoose = require('mongoose');
const Account = require('../models/Account');
const serializeDocument = require('../utils/serializeDocument');

const accountAliases = {
  bankName: 'bank_name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(accounts.map(account => serializeDocument(account, accountAliases)));
  } catch (error) {
    console.error('Fetching accounts failed:', error);
    res.status(500).json({ message: 'Unable to fetch accounts' });
  }
};

exports.addAccount = async (req, res) => {
  const { type, bankName, details, balance } = req.body || {};
  if (typeof type !== 'string' || !type.trim()
    || (details !== undefined && (details === null || typeof details !== 'object' || Array.isArray(details)))
    || (balance !== undefined && !Number.isFinite(Number(balance)))) {
    return res.status(400).json({ message: 'A type, valid details object, and numeric balance are required' });
  }

  try {
    const account = await Account.create({
      userId: req.user.id,
      type: type.trim(),
      bankName: type.trim() === 'bank' ? bankName || details?.bankName || null : null,
      details: details || {},
      balance: balance === undefined ? 0 : Number(balance),
    });
    res.status(201).json(serializeDocument(account, accountAliases));
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid account data' });
    }
    console.error('Creating account failed:', error);
    res.status(500).json({ message: 'Unable to create account' });
  }
};

exports.deleteAccount = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid account ID' });
  }

  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ id: account.id });
  } catch (error) {
    console.error('Deleting account failed:', error);
    res.status(500).json({ message: 'Unable to delete account' });
  }
};
