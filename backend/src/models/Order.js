const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { decimalGetter, jsonGetter } = require('../utils/modelGetters');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  customer: {
    get: jsonGetter('customer', null),
    type: DataTypes.JSON, // Stores customer object
    allowNull: true,
  },
  items: {
    get: jsonGetter('items', []),
    type: DataTypes.JSON, // Stores array of order items
    allowNull: true,
  },
  total: {
    get: decimalGetter('total'),
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Processing',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'orders',
});

module.exports = Order;
