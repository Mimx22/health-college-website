const Staff = require('../models/Staff');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const { sendStaffPasswordResetEmail } = require('../utils/emailService');

// Generate JWT token for staff
const generateToken = (id, role = 'staff') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// 1. Staff Login
const loginStaff = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email/staff ID and password' });
        }

        const identifier = email.trim();

        // Search by email or staffId
        const staff = await Staff.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { staffId: identifier }
            ]
        }).select('+password');

        if (!staff) {
            return res.status(401).json({ success: false, message: 'Invalid staff credentials or account not found' });
        }

        if (staff.accountStatus !== 'active') {
            return res.status(403).json({ 
                success: false, 
                message: `Staff account is ${staff.accountStatus}. Please contact the ICT Center or Office of the Dean.` 
            });
        }

        const isMatch = await staff.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid staff credentials' });
        }

        const token = generateToken(staff._id, staff.role || 'staff');

        res.status(200).json({
            success: true,
            message: 'Staff login successful',
            token,
            _id: staff._id,
            fullName: staff.fullName,
            email: staff.email,
            phone: staff.phone,
            staffId: staff.staffId,
            department: staff.department,
            role: staff.role || 'staff'
        });

    } catch (error) {
        next(error);
    }
};

// 2. Get Authenticated Staff Profile (GET /api/staff/me)
const getStaffProfile = async (req, res, next) => {
    try {
        const staff = await Staff.findById(req.user.id);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff profile not found' });
        }

        res.status(200).json({
            _id: staff._id,
            fullName: staff.fullName,
            email: staff.email,
            phone: staff.phone,
            staffId: staff.staffId,
            department: staff.department,
            role: staff.role || 'staff',
            accountStatus: staff.accountStatus,
            createdAt: staff.createdAt,
            updatedAt: staff.updatedAt
        });
    } catch (error) {
        next(error);
    }
};

// 3. Update Staff Profile (Phone only - role & staffId are protected)
const updateStaffProfile = async (req, res, next) => {
    try {
        const staff = await Staff.findById(req.user.id);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        const { phone } = req.body;
        if (phone !== undefined) {
            staff.phone = phone.trim();
        }

        await staff.save();

        res.status(200).json({
            success: true,
            message: 'Staff contact updated successfully',
            staff: {
                _id: staff._id,
                fullName: staff.fullName,
                email: staff.email,
                phone: staff.phone,
                staffId: staff.staffId,
                department: staff.department,
                role: staff.role || 'staff'
            }
        });
    } catch (error) {
        next(error);
    }
};

// 4. Change Staff Password (In-Profile)
const changeStaffPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
        }

        const staff = await Staff.findById(req.user.id).select('+password');
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        const isMatch = await staff.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        staff.password = newPassword;
        await staff.save();

        res.status(200).json({
            success: true,
            message: 'Staff password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// 5. Staff Forgot Password (Initiate reset flow)
const forgotStaffPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide your registered email' });
        }

        const staff = await Staff.findOne({ email: email.trim().toLowerCase() }).select('+resetPasswordToken +resetPasswordExpires');

        // Always return generic safe message to prevent email enumeration
        if (!staff) {
            return res.status(200).json({
                success: true,
                message: 'If a staff account exists with that email, a password reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        staff.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        staff.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        await staff.save();

        const baseUrl = process.env.BASE_URL || 'https://medicalcareeracademy.ng';
        const resetLink = `${baseUrl}/reset-password.html?token=${resetToken}&portal=staff`;

        await sendStaffPasswordResetEmail(staff.email, staff.fullName, resetLink);

        res.status(200).json({
            success: true,
            message: 'If a staff account exists with that email, a password reset link has been sent.'
        });
    } catch (error) {
        next(error);
    }
};

// 6. Staff Reset Password (Complete reset flow)
const resetStaffPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const staff = await Staff.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires +password');

        if (!staff) {
            return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
        }

        staff.password = password;
        staff.accountStatus = 'active';
        staff.resetPasswordToken = undefined;
        staff.resetPasswordExpires = undefined;

        await staff.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now log in to the Staff Portal.'
        });
    } catch (error) {
        next(error);
    }
};

// 7. Get Applications (Staff Academic Class List view)
const getStaffApplications = async (req, res, next) => {
    try {
        // Staff can view student applications list (without admin privileged actions)
        const apps = await Student.find({}).sort({ createdAt: -1 }).select('-documents.storagePath').lean();
        res.status(200).json(apps);
    } catch (error) {
        next(error);
    }
};

// 8. View Student Document for Academic Review
const viewStudentDocument = async (req, res, next) => {
    try {
        const { id, docIndex } = req.params;
        
        // Ensure id is a valid 24-character hexadecimal ObjectId
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid application ID format' });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student application not found' });
        }

        const index = parseInt(docIndex, 10);
        if (isNaN(index) || index < 0 || !student.documents || index >= student.documents.length) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const doc = student.documents[index];
        const filePath = path.resolve(doc.storagePath);
        const uploadsDir = path.resolve(__dirname, '../uploads');

        // Path traversal guard: verify file resides within intended uploads directory
        if (!filePath.startsWith(uploadsDir)) {
            return res.status(403).json({ success: false, message: 'Invalid document storage path' });
        }
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Document file is missing from server storage' });
        }

        const safeDownloadName = path.basename(doc.originalName).replace(/[^a-zA-Z0-9._\-]/g, '_');

        res.download(filePath, safeDownloadName, (err) => {
            if (err && !res.headersSent) {
                console.error("Error downloading file for staff:", err);
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginStaff,
    getStaffProfile,
    updateStaffProfile,
    changeStaffPassword,
    forgotStaffPassword,
    resetStaffPassword,
    getStaffApplications,
    viewStudentDocument
};
