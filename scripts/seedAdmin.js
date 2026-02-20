const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'admin@josmed.edu.ng';
    const password = 'adminpassword123';

    // Remove any old admin accounts to avoid conflicts
    const deleted = await Student.deleteMany({ role: 'admin' });
    console.log(`🗑️  Cleared ${deleted.deletedCount} old admin account(s).`);

    const hashed = await bcrypt.hash(password, 10);

    const admin = new Student({
      fullName: 'Site Admin',
      email,
      phone: '0000000000',
      password: hashed,
      tempPass: password,
      program: 'Administration',
      role: 'admin',
      admissionStatus: 'approved'
    });

    await admin.save();
    console.log('');
    console.log('✅ Admin account created successfully!');
    console.log('================================');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    console.log('================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message || err);
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
