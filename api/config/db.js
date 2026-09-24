const mongoose = require('mongoose');
const Admin = require('../models/Admin');

global.__dbError = null;

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the environment variables.');
        }

        const uri = process.env.MONGO_URI || 'mongodb://glittercost_db_user:%24miracle2255@ac-nigzd1w-shard-00-00.lv0fc0l.mongodb.net:27017,ac-nigzd1w-shard-00-01.lv0fc0l.mongodb.net:27017,ac-nigzd1w-shard-00-02.lv0fc0l.mongodb.net:27017/josmedicalcollege?ssl=true&replicaSet=atlas-123aol-shard-0&authSource=admin&retryWrites=true&w=majority';
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
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
        global.__dbError = error.message;
        console.error(`Error connecting to MongoDB: ${error.message}`);
    }
};

module.exports = connectDB;
