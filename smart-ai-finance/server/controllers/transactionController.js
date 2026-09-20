const { pool } = require('../config/db');

exports.getTransactions = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTransaction = async (req, res) => {
  const { name, amount, type, category, date } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO transactions (user_id, name, amount, type, category, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, name, amount, type, category, date]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Transaction not found' });
    
    if (rows[0].user_id !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
