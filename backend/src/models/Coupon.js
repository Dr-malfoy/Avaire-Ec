const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { decimalGetter, jsonGetter } = require('../utils/modelGetters');

const Coupon = sequelize.define('Coupon', {
  code: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  discountType: {
    type: DataTypes.ENUM('percent', 'fixed', 'shipping'),
    allowNull: false
  },
  discountValue: {
    get: decimalGetter('discountValue'),
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'coupons'
});

module.exports = Coupon;
