const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { decimalGetter, jsonGetter } = require('../utils/modelGetters');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  price: {
    get: decimalGetter('price'),
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  originalPrice: {
    get: decimalGetter('originalPrice'),
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  badge: {
    type: DataTypes.ENUM('new', 'sale'),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sizes: {
    get: jsonGetter('sizes', []),
    type: DataTypes.JSON, // Stores an array of strings
    defaultValue: [],
  },
  colors: {
    get: jsonGetter('colors', []),
    type: DataTypes.JSON, // Stores an array of strings
    defaultValue: [],
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  images: {
    get: jsonGetter('images', []),
    type: DataTypes.JSON, // Stores an array of strings
    defaultValue: [],
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  stockCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'products',
});

module.exports = Product;
