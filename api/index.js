const express = require('express');
const app = express();
let errorLog = [];

try {
    const mongoose = require('mongoose');
    console.log('Mongoose required');
} catch (e) { errorLog.push('mongoose: ' + e.message); }

try {
    require('../models/Student');
    console.log('Student Model required');
} catch (e) { errorLog.push('StudentModel: ' + e.message); }

try {
    require('../utils/sendEmail');
    console.log('sendEmail required');
} catch (e) { errorLog.push('sendEmail: ' + e.message); }

try {
    require('../routes/authRoutes');
    console.log('authRoutes required');
} catch (e) { errorLog.push('authRoutes: ' + e.message); }

app.get('/api/health', (req, res) => {
    res.json({
        status: errorLog.length > 0 ? 'degraded' : 'ok',
        errors: errorLog,
        env: {
            MONGO_URI: process.env.MONGO_URI ? 'SET' : 'MISSING'
        }
    });
});

module.exports = app;
