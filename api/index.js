const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check with REAL DB CONNECTION attempt
app.get('/api/health', async (req, res) => {
    let dbStatus = 'Disconnected';
    let error = null;

    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('Attempting DB Connection...');
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000 // fail fast for diagnostics
            });
            console.log('DB Connected');
        }
        dbStatus = 'Connected';
    } catch (e) {
        dbStatus = 'Error';
        error = e.message;
        console.error('DB Connection Failed:', e);
    }

    res.json({
        status: 'ok',
        db: dbStatus,
        error: error,
        time: new Date().toISOString()
    });
});

module.exports = app;
