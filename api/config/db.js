const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the environment variables.');
        }

        // Fallback to the raw connection string if environment variable is overridden by cPanel
        const rawUri = 'mongodb://glittercost_db_user:%24Miracle2255@ac-nigzd1w-shard-00-00.lv0fc0l.mongodb.net:27017,ac-nigzd1w-shard-00-01.lv0fc0l.mongodb.net:27017,ac-nigzd1w-shard-00-02.lv0fc0l.mongodb.net:27017/josmedicalcollege?ssl=true&replicaSet=atlas-123aol-shard-0&authSource=admin&retryWrites=true&w=majority';
        const conn = await mongoose.connect(rawUri, { serverSelectionTimeoutMS: 60000 });
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
