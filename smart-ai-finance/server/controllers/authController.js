const jwt = require('jsonwebtoken');
const User = require('../models/User');
const serializeDocument = require('../utils/serializeDocument');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;
  if (!name || !email || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const user = await User.create({ name, email, password });
    res.status(201).json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'User already exists' });
    console.error('User registration failed:', error);
    res.status(500).json({ message: 'Unable to register user' });
  }
};

exports.loginUser = async (req, res) => {
  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;
  if (!email || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
  } catch (error) {
    console.error('User login failed:', error);
    res.status(500).json({ message: 'Unable to log in' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(serializeDocument(user, { createdAt: 'created_at' }));
  } catch (error) {
    console.error('Fetching current user failed:', error);
    res.status(500).json({ message: 'Unable to fetch user' });
  }
};
