const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const studentAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader || typeof authHeader !== 'string') {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Authorization format must be "Bearer <token>"' });
        }

        const token = parts[1];
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT secret not configured on server' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const student = await Student.findById(decoded.id).select('-password');
        if (!student) {
            return res.status(401).json({ message: 'Student not found' });
        }

        req.student = student;
        next();
    } catch (err) {
        if (err && err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { studentAuth };
