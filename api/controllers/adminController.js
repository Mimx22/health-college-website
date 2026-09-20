const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            res.status(200).json({
                success: true,
                _id: admin._id,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id, admin.role)
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};

const getApplications = async (req, res, next) => {
    try {
        // Implementation goes here
        res.status(200).json({ success: true, message: 'Get applications endpoint placeholder' });
    } catch (error) {
        next(error);
    }
};

const updateApplicationStatus = async (req, res, next) => {
    try {
        // Implementation goes here
        res.status(200).json({ success: true, message: 'Update application status endpoint placeholder' });
    } catch (error) {
        next(error);
    }
};

module.exports = { loginAdmin, getApplications, updateApplicationStatus };
