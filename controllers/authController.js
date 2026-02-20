const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    let user = await Student.findOne({ email });
    let role = 'student';

    if (!user) {
        user = await Staff.findOne({ email });
        role = 'staff';
    }

    // Admin Check
    if (email === 'admin@josmed.edu.ng' && password === 'adminpassword123') {
        return res.json({
            _id: 'admin',
            fullName: 'Admin',
            email: 'admin@josmed.edu.ng',
            role: 'admin',
            token: generateToken('admin'),
        });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: role,
            token: generateToken(user._id),
            studentId: user.studentId,
            program: user.program,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc   Request a password-reset link
// @route  POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
    try {
        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID or Email is required' });
        }

        console.log(`🔑 Forgot-password request for: "${studentId}"`);

        // Try studentId first, then fall back to email
        let user = await Student.findOne({ studentId: studentId.trim().toUpperCase() });

        if (!user) {
            user = await Student.findOne({ email: studentId.trim().toLowerCase() });
        }

        if (!user) {
            console.log(`⚠️  No student found for: "${studentId}"`);
            return res.status(200).json({
                success: true,
                message: 'If an account exists, a reset link will be sent.'
            });
        }

        console.log(`✅ Student found: ${user.fullName} <${user.email}>`);

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const portalUrl = process.env.PORTAL_URL || 'http://localhost:5000';
        const resetUrl = `${portalUrl}/reset-password.html?token=${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>Hello ${user.fullName},</p>
            <p>You requested a password reset. Please click the button below to set a new password. This link is valid for 10 minutes.</p>
            <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset My Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message,
            });
            console.log('📧 Reset email sent successfully');
            res.status(200).json({ success: true, message: 'Reset email sent' });
        } catch (err) {
            console.error('❌ Email could not be sent:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc   Reset password with token
// @route  POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await Student.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set New Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new student
// @route   POST /api/auth/register
const registerStudent = async (req, res) => {
    const { fullName, email, phone, program, password } = req.body;
    const userExists = await Student.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
        fullName,
        email,
        phone,
        program,
        password: hashedPassword,
        admissionStatus: 'Pending'
    });

    if (student) {
        res.status(201).json({
            _id: student._id,
            fullName: student.fullName,
            email: student.email,
            token: generateToken(student._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { loginUser, registerStudent, forgotPassword, resetPassword };
