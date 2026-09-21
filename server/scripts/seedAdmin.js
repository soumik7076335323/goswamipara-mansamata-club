/**
 * Seed the initial admin user and default website settings.
 * Usage: npm run seed:admin
 * Credentials come from .env (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME).
 */
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');
const WebsiteSettings = require('../models/WebsiteSettings');

async function run() {
  await connectDB();
  const email = config.adminEmail.toLowerCase().trim();
  let user = await User.findOne({ email });
  if (user) {
    console.log(`Admin already exists: ${email}`);
  } else {
    user = await User.create({
      name: config.adminName,
      email,
      role: 'admin',
      passwordHash: await bcrypt.hash(config.adminPassword, 10),
    });
    console.log(`Admin created: ${email}`);
  }
  await WebsiteSettings.getMain();
  console.log('Website settings initialized with official club defaults.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
