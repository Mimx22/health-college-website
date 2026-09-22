const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the environment variables.');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 60000 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Seed default admin if none exists
        try {
            const adminExists = await Admin.findOne({ email: 'admin@medicalcareeracademy.ng' });
            if (!adminExists) {
                await Admin.create({
                    email: 'admin@medicalcareeracademy.ng',
                    password: 'admin123'
                });
                console.log('Default Admin seeded (admin@medicalcareeracademy.ng / admin123)');
            }
        } catch (seedErr) {
            console.error('Error seeding admin:', seedErr.message);
        }

    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Removed process.exit(1) to allow validation testing even if DB is down
    }
};

module.exports = connectDB;
