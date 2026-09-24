const RateLimit = require('../models/RateLimit');

const rateLimiter = (maxRequests, windowMs = 15 * 60 * 1000) => {
    return async (req, res, next) => {
        try {
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const endpoint = req.originalUrl;
            const key = `${clientIp}_${endpoint}`;

            // Find existing rate limit record
            const record = await RateLimit.findOne({ key });

            if (record) {
                if (record.count >= maxRequests) {
                    const msg = endpoint.includes('/register') 
                        ? 'Too many submission attempts. Please wait a few minutes and try again.'
                        : 'Too many requests. Please try again later.';
                    return res.status(429).json({ success: false, message: msg });
                }
                
                // Increment count
                record.count += 1;
                await record.save();
            } else {
                // Create new record
                await RateLimit.create({ key, count: 1 });
            }

            next();
        } catch (error) {
            console.error('Rate Limiter Error:', error);
            // In case of DB error, let the request through rather than crashing the endpoint
            next();
        }
    };
};

module.exports = rateLimiter;
