const mongoose = require('mongoose');
const { getLastDbError } = require('../config/db');

const getHealth = (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const dbStatus = dbStatusMap[dbState] || 'unknown';
    const dbError = getLastDbError();
    const mongoUri = process.env.MONGO_URI || 'NOT SET';

    res.status(200).json({
        success: true,
        message: 'API is running',
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus,
        dbError: dbError || null,
        mongoUriPrefix: mongoUri.substring(0, 50) + '...'
    });
};

module.exports = { getHealth };
