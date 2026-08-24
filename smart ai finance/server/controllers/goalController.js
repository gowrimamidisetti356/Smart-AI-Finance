const { pool } = require('../config/db');

exports.getGoals = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM goals WHERE user_id = $1', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addGoal = async (req, res) => {
  const { title, targetAmount, currentAmount, deadline } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO goals (user_id, title, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, title, targetAmount, currentAmount || 0, deadline]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: goals } = await pool.query('SELECT * FROM goals WHERE id = $1', [id]);
    if (goals.length === 0) return res.status(404).json({ message: 'Goal not found' });
    
    if (goals[0].user_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, targetAmount, currentAmount, deadline, status } = req.body;
    
    const newTitle = title || goals[0].title;
    const newTargetAmount = targetAmount !== undefined ? targetAmount : goals[0].target_amount;
    const newCurrentAmount = currentAmount !== undefined ? currentAmount : goals[0].current_amount;
    const newDeadline = deadline || goals[0].deadline;
    const newStatus = (newCurrentAmount >= newTargetAmount) ? 'completed' : (status || goals[0].status);

    const { rows: updated } = await pool.query(
      'UPDATE goals SET title = $1, target_amount = $2, current_amount = $3, deadline = $4, status = $5 WHERE id = $6 RETURNING *',
      [newTitle, newTargetAmount, newCurrentAmount, newDeadline, newStatus, id]
    );

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM goals WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Goal not found' });
    
    if (rows[0].user_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await pool.query('DELETE FROM goals WHERE id = $1', [id]);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGoalsProgress = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, title, target_amount, current_amount, status FROM goals WHERE user_id = $1', [req.user.id]);
    const progressData = rows.map(g => ({
      id: g.id,
      title: g.title,
      progressPercentage: g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(2) : 0,
      status: g.status
    }));
    res.json(progressData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
