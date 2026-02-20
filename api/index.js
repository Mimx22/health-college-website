const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection Middleware
const connectDB = async (req, res, next) => {
    if (mongoose.connection.readyState >= 1) {
        next();
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        next();
    } catch (err) {
        console.error('DB Connection Error:', err);
        res.status(500).json({ message: 'Database connection failed' });
    }
};

// Health Check (Public)
app.get('/api/health', connectDB, (req, res) => {
    res.json({
        status: 'ok',
        db: 'Connected',
        time: new Date().toISOString()
    });
});

// Real Routes (Standardized)
app.use('/api/auth', connectDB, require('../routes/authRoutes'));
app.use('/api/students', connectDB, require('../routes/studentRoutes'));
app.use('/api/staff', connectDB, require('../routes/staffRoutes'));
app.use('/api/admin', connectDB, require('../routes/adminRoutes'));

// Root path for the API
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to JMC API' });
});

module.exports = app;
