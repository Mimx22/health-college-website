const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Used for general auth (admin/staff)
const authMiddleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Since we don't have a unified User model, we'll just pass the ID for now
            // and let specific controllers handle user lookup if needed.
            req.user = { id: decoded.id };
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized' });
        }
    } else {
        res.status(401).json({ message: 'No token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Simple admin check for now
        if (req.user && req.user.id === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    };
};

// Legacy 'protect' for staff/student routes if needed
const protect = authMiddleware;

module.exports = { authMiddleware, authorizeRoles, protect };
