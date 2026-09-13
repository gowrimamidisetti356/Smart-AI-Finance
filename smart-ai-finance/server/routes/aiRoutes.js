const express = require('express');
const router = express.Router();
const { chatWithAI, getChatHistory } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.route('/chat').post(protect, chatWithAI);
router.route('/history').get(protect, getChatHistory);

module.exports = router;
