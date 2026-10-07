const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ChatConversation = sequelize.define('ChatConversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  customerName: {
    type: DataTypes.STRING,
    defaultValue: 'Guest',
  },
  customerEmail: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open',
  },
  unreadByAdmin: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unreadByCustomer: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastMessage: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'chat_conversations',
});

module.exports = ChatConversation;
