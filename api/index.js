const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        env: {
            MONGO_URI: process.env.MONGO_URI ? 'SET' : 'MISSING',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING'
        }
    });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');

app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/students', require('../routes/studentRoutes'));
app.use('/api/staff', require('../routes/staffRoutes'));
app.use('/api/admin', require('../routes/adminRoutes'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully 🍃'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Export for Vercel
module.exports = app;
