const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Reduced timeout so it fails faster if no DB
        const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Removed process.exit(1) to allow validation testing even if DB is down
    }
};

module.exports = connectDB;
