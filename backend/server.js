const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mysql = require('mysql2/promise');
const { DataTypes } = require('sequelize');
const app = require('./src/app');
const { connectDB, sequelize } = require('./src/config/db');
const bcrypt = require('bcrypt');
const Section = require('./src/models/Section');
const User = require('./src/models/User');

const PORT = process.env.PORT || 5000;

// Columns added after the first release. Added here so existing databases keep working
// without running sync({ alter: true }) on every start (which piles up duplicate indexes).
const ensureColumns = async () => {
  const qi = sequelize.getQueryInterface();
  const wanted = {
    abandoned_carts: {
      source: { type: DataTypes.STRING, defaultValue: 'checkout' },
      phone: { type: DataTypes.STRING, allowNull: true },
    },
  };
  for (const [table, cols] of Object.entries(wanted)) {
    const existing = await qi.describeTable(table);
    for (const [name, def] of Object.entries(cols)) {
      if (!existing[name]) {
        await qi.addColumn(table, name, def);
        console.log(`Added column ${table}.${name}`);
      }
    }
  }
};

// Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist yet.
// An existing account is never changed here (use `node seedAdmin.js --reset` for that).
const ensureAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || password.length < 8) return;
  const existing = await User.findOne({ where: { email } });
  if (existing) return;
  await User.create({ name: 'Admin', email, password: await bcrypt.hash(password, 10), role: 'admin' });
  console.log(`Admin account created: ${email}`);
};

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing in backend/.env — refusing to start.');
    process.exit(1);
  }

  try {
    // 1. Create database if it doesn't exist (skip gracefully if permissions are restricted)
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
      await connection.end();
      console.log(`Ensured database '${process.env.DB_NAME}' exists.`);
    } catch (dbCreateError) {
      console.log(`Note: Skipping database creation step (normal on cPanel/shared hosting). Assuming database '${process.env.DB_NAME}' already exists.`);
    }

    // 2. Connect and create any missing tables
    await connectDB();
    const alter = process.env.DB_SYNC_ALTER === 'true';
    await sequelize.sync(alter ? { alter: true } : {});
    await ensureColumns();
    await ensureAdmin();
    console.log(`Database synced${alter ? ' (alter mode)' : ''}. Tables are ready.`);

    // Seed sections if empty
    const sectionCount = await Section.count();
    if (sectionCount === 0) {
      await Section.bulkCreate([
        { id: 'collection', label: 'Collection', desc: 'Main catalogue', emoji: '📁' },
        { id: 'new_arrival', label: 'New Arrival', desc: 'Latest drops', emoji: '✨' },
        { id: 'sale', label: 'Sale', desc: 'Discounted items', emoji: '🏷️' },
      ]);
      console.log('Seeded initial product sections.');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('Database connection closed.');
        } catch (err) {
          console.error('Error closing database connection:', err);
        }
        process.exit(0);
      });

      // Force shutdown if taking longer than 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

