const rateLimitMap = new Map();

// Cleans up old entries every hour to prevent memory leaks
setInterval(() => {
    rateLimitMap.clear();
}, 60 * 60 * 1000);

const rateLimiter = (maxRequests, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const now = Date.now();
        const endpoint = req.originalUrl;
        const key = `${clientIp}_${endpoint}`;

        if (rateLimitMap.has(key)) {
            const clientData = rateLimitMap.get(key);
            if (now - clientData.startTime < windowMs) {
                if (clientData.count >= maxRequests) {
                    return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
                }
                clientData.count++;
            } else {
                rateLimitMap.set(key, { count: 1, startTime: now });
            }
        } else {
            rateLimitMap.set(key, { count: 1, startTime: now });
        }
        next();
    };
};

module.exports = rateLimiter;
