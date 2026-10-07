'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      originalPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      category: { type: Sequelize.STRING, allowNull: false },
      section: { type: Sequelize.STRING, allowNull: true },
      badge: { type: Sequelize.ENUM('new', 'sale', 'bestseller', 'none'), defaultValue: 'none' },
      description: { type: Sequelize.TEXT, allowNull: true },
      sizes: { type: Sequelize.JSON, defaultValue: [] },
      colors: { type: Sequelize.JSON, defaultValue: [] },
      image: { type: Sequelize.STRING, allowNull: true },
      images: { type: Sequelize.JSON, defaultValue: [] },
      icon: { type: Sequelize.STRING, allowNull: true },
      inStock: { type: Sequelize.BOOLEAN, defaultValue: true },
      stockCount: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      orderNumber: { type: Sequelize.STRING, allowNull: false, unique: true },
      customer: { type: Sequelize.JSON, allowNull: false },
      items: { type: Sequelize.JSON, allowNull: false },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.STRING, defaultValue: 'Processing' },
      paymentMethod: { type: Sequelize.STRING, allowNull: true },
      paymentIntentId: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('admin', 'user'), defaultValue: 'user' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('abandoned_carts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      country: { type: Sequelize.STRING, allowNull: true },
      zip: { type: Sequelize.STRING, allowNull: true },
      items: { type: Sequelize.JSON, allowNull: false },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.STRING, defaultValue: 'abandoned' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('chat_conversations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      sessionId: { type: Sequelize.STRING, allowNull: false, unique: true },
      customerName: { type: Sequelize.STRING, defaultValue: 'Guest' },
      customerEmail: { type: Sequelize.STRING, defaultValue: '' },
      status: { type: Sequelize.ENUM('open', 'resolved'), defaultValue: 'open' },
      unreadByAdmin: { type: Sequelize.INTEGER, defaultValue: 0 },
      unreadByCustomer: { type: Sequelize.INTEGER, defaultValue: 0 },
      lastMessage: { type: Sequelize.TEXT, defaultValue: '' },
      lastMessageAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('chat_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      conversationId: { type: Sequelize.UUID, allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      sender: { type: Sequelize.ENUM('customer', 'admin'), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('coupons', {
      code: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
      discountType: { type: Sequelize.ENUM('percent', 'fixed', 'shipping'), allowNull: false },
      discountValue: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Sections', {
      id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
      label: { type: Sequelize.STRING, allowNull: false },
      desc: { type: Sequelize.STRING, allowNull: true },
      emoji: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('settings', {
      key: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
      value: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('settings');
    await queryInterface.dropTable('Sections');
    await queryInterface.dropTable('coupons');
    await queryInterface.dropTable('chat_messages');
    await queryInterface.dropTable('chat_conversations');
    await queryInterface.dropTable('abandoned_carts');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('products');
  }
};
