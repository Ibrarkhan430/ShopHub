// backend/create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const email = 'admin@gmail.com';
    const password = 'admin123';

    await User.deleteOne({ email: email });
    console.log('✅ Old admin deleted');

    const admin = await User.create({
      name: 'Admin',
      email: email,
      password: password,
      role: 'admin',
    });

    console.log(`✅ Admin created!`);
    console.log(`📌 Email: ${admin.email}`);
    console.log(`📌 Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();