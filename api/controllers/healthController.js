const mongoose = require('mongoose');

const getHealth = (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const dbStatus = dbStatusMap[dbState] || 'unknown';
    const mongoUri = process.env.MONGO_URI || 'NOT SET';

    res.status(200).json({
        success: true,
        message: 'API is running',
        version: 'v2-diagnostics',
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus,
        dbError: global.__dbError || null,
        mongoUriStart: mongoUri.substring(0, 60) + '...'
    });
};

module.exports = { getHealth };
