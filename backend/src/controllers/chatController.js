const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');

const getOrCreateConversation = async (req, res, next) => {
  try {
    const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId.slice(0, 100) : '';
    const name = typeof req.query.name === 'string' ? req.query.name.slice(0, 100) : '';
    const email = typeof req.query.email === 'string' ? req.query.email.slice(0, 200) : '';
    if (!sessionId) {
      res.status(400);
      throw new Error('Session ID is required');
    }

    let conversation = await ChatConversation.findOne({ where: { sessionId } });

    if (!conversation) {
      conversation = await ChatConversation.create({
        sessionId,
        customerName: name ? String(name).trim() : 'Guest',
        customerEmail: email ? String(email).trim() : '',
      });
    } else {
      let changed = false;
      if (name && conversation.customerName !== name.trim()) {
        conversation.customerName = name.trim();
        changed = true;
      }
      if (email && conversation.customerEmail !== email.trim()) {
        conversation.customerEmail = email.trim();
        changed = true;
      }
      if (changed) {
        await conversation.save();
      }
    }

    if (conversation.unreadByCustomer > 0) {
      conversation.unreadByCustomer = 0;
      await conversation.save();
    }

    const messages = await ChatMessage.findAll({
      where: { conversationId: conversation.id },
      order: [['createdAt', 'ASC']],
    });

    res.json({ conversation, messages });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const content = typeof req.body?.content === 'string' ? req.body.content : '';
    const sender = 'customer'; // admin replies go through /api/admin/chat only

    if (!content.trim() || content.length > 2000) {
      res.status(400);
      throw new Error('Message content is required');
    }

    let conversation = await ChatConversation.findOne({ where: { sessionId } });
    if (!conversation) {
      conversation = await ChatConversation.create({ sessionId });
    }

    const message = await ChatMessage.create({
      conversationId: conversation.id,
      content: content.trim(),
      sender,
    });

    // Update conversation last message and unread counts
    conversation.lastMessage = content.trim();
    conversation.lastMessageAt = new Date();
    
    if (sender === 'customer') {
      conversation.unreadByAdmin = (conversation.unreadByAdmin || 0) + 1;
    } else {
      conversation.unreadByCustomer = (conversation.unreadByCustomer || 0) + 1;
    }
    
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

const getAllConversations = async (req, res, next) => {
  try {
    const conversations = await ChatConversation.findAll({
      order: [['lastMessageAt', 'DESC']],
    });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getAllConversations,
};
