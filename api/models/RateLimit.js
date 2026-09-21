const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // 15 minutes TTL automatically drops the document
    }
});

module.exports = mongoose.model('RateLimit', rateLimitSchema);
