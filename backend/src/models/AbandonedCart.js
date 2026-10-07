const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { decimalGetter, jsonGetter } = require('../utils/modelGetters');

const AbandonedCart = sequelize.define('AbandonedCart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  zip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  items: {
    get: jsonGetter('items', []),
    type: DataTypes.JSON,
    allowNull: false,
  },
  total: {
    get: decimalGetter('total'),
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'checkout',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'abandoned',
  }
}, {
  timestamps: true,
  tableName: 'abandoned_carts',
});

module.exports = AbandonedCart;
