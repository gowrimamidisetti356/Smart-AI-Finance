const { pool } = require('../config/db');

exports.getAccounts = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAccount = async (req, res) => {
  const { type, bankName, details, balance } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO accounts (user_id, type, bank_name, details, balance) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, type, type === 'bank' ? bankName || details?.bankName || null : null, details || {}, balance || 0]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM accounts WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Account not found' });
    
    if (rows[0].user_id !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await pool.query('DELETE FROM accounts WHERE id = $1', [req.params.id]);
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
