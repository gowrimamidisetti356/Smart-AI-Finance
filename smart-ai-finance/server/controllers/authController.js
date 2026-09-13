const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { rows: existingUser } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.length > 0) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows: userRows } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = userRows[0];
    res.status(201).json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows: users } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { rows: users } = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
