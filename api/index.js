const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/students', require('../routes/studentRoutes'));
app.use('/api/staff', require('../routes/staffRoutes'));
app.use('/api/admin', require('../routes/adminRoutes'));

// Health & Diagnostic
app.get('/api/health', async (req, res) => {
    let dbStatus = 'Not Connected';
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...';
    } catch (e) {
        dbStatus = 'Error: ' + e.message;
    }

    res.json({
        status: 'ok',
        db: dbStatus,
        time: new Date().toISOString()
    });
});

// Initial Connection (non-blocking)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('DB Connected'))
    .catch(err => console.error('DB Error:', err));

module.exports = app;
