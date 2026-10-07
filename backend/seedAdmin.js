// Create (or reset) the admin account.
//   node seedAdmin.js                      -> uses ADMIN_EMAIL / ADMIN_PASSWORD from .env
//   node seedAdmin.js you@mail.com Pass123 -> uses the given email / password
//   add --reset to change the password of an existing admin
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectDB } = require('./src/config/db');
const User = require('./src/models/User');

const args = process.argv.slice(2).filter((a) => a !== '--reset');
const reset = process.argv.includes('--reset');
const email = (args[0] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = args[1] || process.env.ADMIN_PASSWORD || '';

const seedAdmin = async () => {
  if (!email || password.length < 8) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in backend/.env, or run:');
    console.error('  node seedAdmin.js admin@example.com YourStrongPassword');
    process.exit(1);
  }

  try {
    await connectDB();
    await User.sync();

    const hash = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ where: { email } });

    if (existing) {
      if (!reset) {
        console.log(`User ${email} already exists. Run with --reset to set a new password and make it admin.`);
        process.exit(0);
      }
      await existing.update({ password: hash, role: 'admin' });
      console.log(`Admin ${email} updated.`);
    } else {
      await User.create({ name: 'Admin', email, password: hash, role: 'admin' });
      console.log(`Admin ${email} created.`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error);
    process.exit(1);
  }
};

seedAdmin();
