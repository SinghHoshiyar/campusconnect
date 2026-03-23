const express = require('express');
const router = express.Router();
const { getChatHistory, saveChatMessage, clearChatHistory, askAssistant } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getChatHistory)
  .post(protect, saveChatMessage)
  .delete(protect, clearChatHistory);

router.post('/ask', protect, askAssistant);

module.exports = router;
