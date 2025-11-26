const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  listConversations,
  listMessages,
  sendMessage,
  markReadConversation,
  markReadOne,
} = require('../controllers/messagesController');

// همه‌ی روت‌های پیام، محافظت شده
router.use(protect);

router.get('/conversations', listConversations);
router.get('/conversations/:id/messages', listMessages);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/read', markReadConversation);
router.post('/messages/:messageId/read', markReadOne);

module.exports = router;
