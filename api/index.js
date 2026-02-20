const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Diagnostic Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        engine: 'Express on Vercel',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected',
        time: new Date().toISOString()
    });
});

// Re-add Models and Routes (Standard folder structure)
const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');

app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/students', require('../routes/studentRoutes'));
app.use('/api/staff', require('../routes/staffRoutes'));
app.use('/api/admin', require('../routes/adminRoutes'));

// Database Connection (using standard stable patterns)
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error('MongoDB Error:', err));
}

module.exports = app;
