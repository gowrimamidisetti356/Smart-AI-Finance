const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);
      if (rows.length === 0) throw new Error('User not found');
      
      req.user = rows[0];
      return next();
    } catch (error) {
      // Allow bypass for local dev
    }
  }

  // Developer Bypass - auto inject test user context if no token exists in frontend header
  try {
    let { rows } = await pool.query("SELECT id, name, email FROM users WHERE email = 'test@example.com'");
    if (rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      const insert = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ('Test User', 'test@example.com', $1) RETURNING id, name, email",
        [hashedPassword]
      );
      rows = insert.rows;

      // Seed dummy transactions for richer AI testing
      const testUserId = rows[0].id;
      await pool.query(
        "INSERT INTO transactions (user_id, name, amount, type, category, date) VALUES ($1, 'Salary', 5000, 'income', 'Salary', CURRENT_DATE), ($1, 'Pizza', 45, 'expense', 'Food', CURRENT_DATE)",
        [testUserId]
      );
    }
    req.user = rows[0];
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Auto-login failed', error: error.message });
  }
};

module.exports = { protect };
