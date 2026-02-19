const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  try {
    const email = 'admin@college.edu';
    const existing = await Student.findOne({ email });
    if (existing) {
      if (existing.role === 'admin') {
        console.log('Admin already exists:', email);
      } else {
        existing.role = 'admin';
        await existing.save();
        console.log('Updated existing user to admin:', email);
      }
      process.exit(0);
    }

    const password = 'AdminPass123!';
    const hashed = await bcrypt.hash(password, 10);

    const admin = new Student({
      fullName: 'Site Admin',
      email,
      phone: '0000000000',
      password: hashed,
      program: 'Administration',
      role: 'admin',
      admissionStatus: 'approved'
    });

    await admin.save();
    console.log('Created admin user:', email);
    console.log('Password:', password);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedAdmin();
