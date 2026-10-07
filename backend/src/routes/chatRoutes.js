const express = require('express');
const { getOrCreateConversation, sendMessage, getAllConversations } = require('../controllers/chatController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// GET /api/chat?sessionId=... -> fetch or create a conversation for a customer
router.get('/', getOrCreateConversation);

// POST /api/chat/:sessionId -> send a new message in a conversation
router.post('/:sessionId', sendMessage);

// GET /api/chat/admin -> fetch all conversations for admin dashboard
router.get('/admin', protect, adminOnly, getAllConversations);

module.exports = router;
