const Chat = require('../models/Chat');
const { generateAIResponse } = require('../services/aiService');
const serializeDocument = require('../utils/serializeDocument');

exports.chatWithAI = async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ reply: 'Message is required.' });

  try {
    const reply = await generateAIResponse(req.user.id, message);
    const chat = await Chat.create({ userId: req.user.id, message, response: reply });
    res.status(201).json({ reply: chat.response, id: chat.id });
  } catch (error) {
    console.error('AI assistant request failed:', error);
    res.status(500).json({ reply: 'Sorry, something went wrong. Please try again.' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(chats.map(chat => serializeDocument(chat, { createdAt: 'created_at' })));
  } catch (error) {
    console.error('Fetching chat history failed:', error);
    res.status(500).json({ message: 'Unable to fetch chat history' });
  }
};
