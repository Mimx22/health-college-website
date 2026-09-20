require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Admin = require('../api/models/Admin');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'admin@josmed.edu.ng';
        const password = 'Admin!2026!Secret'; // Clear text here just to hash it

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists!');
            process.exit(0);
        }

        const admin = new Admin({
            email,
            password, // Mongoose pre-save hook will hash this!
            role: 'admin'
        });

        await admin.save();
        console.log(`Successfully created admin user: ${email}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedAdmin();
