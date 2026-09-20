const mongoose = require('mongoose');

const getHealth = (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
        success: true,
        message: 'API is running',
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus
    });
};

module.exports = { getHealth };
