const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const ChatConversation = require('./ChatConversation');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sender: {
    type: DataTypes.ENUM('customer', 'admin'),
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'chat_messages',
});

// Define Relationships
ChatConversation.hasMany(ChatMessage, { foreignKey: 'conversationId', as: 'messages' });
ChatMessage.belongsTo(ChatConversation, { foreignKey: 'conversationId', as: 'conversation' });

module.exports = ChatMessage;
