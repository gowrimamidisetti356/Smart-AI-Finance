const { pool } = require('../config/db');
const { generateAIResponse } = require('../services/aiService');

exports.chatWithAI = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({ reply: "Message is required." });
  }
  
  try {
    const reply = await generateAIResponse(userId, message);

    const { rows } = await pool.query(
      'INSERT INTO chats (user_id, message, response) VALUES ($1, $2, $3) RETURNING id, response',
      [userId, message, reply]
    );

    res.status(201).json({ reply: rows[0].response, id: rows[0].id });
  } catch (error) {
    console.error("AI Assistant Error:", error.message);
    res.status(500).json({ reply: "Sorry, something went wrong. Please try again." });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
