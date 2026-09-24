const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sendConfirmationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { isValidMagicBytes } = require('../utils/magicBytes');

// Helper to clean up uploaded files on error from local storage
const cleanupFiles = async (files) => {
    if (!files || !Array.isArray(files)) return;
    for (const file of files) {
        try {
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        } catch (err) {
            console.error(`Failed to delete local file ${file.filename}:`, err);
        }
    }
};

const generateToken = (id, role = 'student') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const generateApplicationNumber = async () => {
    const year = new Date().getFullYear();
    let isUnique = false;
    let appNumber;
    
    let attempts = 0;
    while (!isUnique && attempts < 20) {
        // Generate a 6-digit collision-resistant number (100000 - 999999)
        const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
        appNumber = `JMC-${year}-${randomPart}`;
        
        const existing = await Student.findOne({ applicationNumber: appNumber });
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }
    
    if (!isUnique) throw new Error('Could not generate unique application number');
    return appNumber;
};

// 1. Admission Application Submission
const registerStudent = async (req, res, next) => {
    try {
        if (!req.files || req.files.length !== 6) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'Exactly 6 documents are required.' });
        }

        let { fullName, email, phone, program } = req.body;
        
        fullName = fullName ? fullName.trim() : '';
        email = email ? email.trim().toLowerCase() : '';
        phone = phone ? phone.trim() : '';
        program = program ? program.trim() : '';

        if (!fullName || fullName.length > 100) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'A valid full name (maximum 100 characters) is required.' });
        }
        if (!email || email.length > 100 || !/^\S+@\S+\.\S+$/.test(email)) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'A valid email address is required.' });
        }
        if (!phone || phone.length < 10 || phone.length > 20 || !/^[\d\s+\-()]+$/.test(phone)) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'A valid phone number is required.' });
        }
        if (!program || program.length > 100) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'A valid program is required.' });
        }

        // Validate each uploaded document for size (<= 5MB) and true file signature (magic bytes)
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        for (const file of req.files) {
            // Check size (5MB = 5 * 1024 * 1024 bytes)
            if (file.size > 5 * 1024 * 1024) {
                await cleanupFiles(req.files);
                return res.status(400).json({ success: false, message: 'File too large. Each document must not exceed 5 MB.' });
            }

            // Check mime type
            if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
                await cleanupFiles(req.files);
                return res.status(400).json({ success: false, message: 'Invalid file type. Please upload a valid PDF, JPG, JPEG, or PNG file.' });
            }

            // Check actual file content signature via magic bytes
            const hasValidSignature = isValidMagicBytes(file.path, file.mimetype.toLowerCase());
            if (!hasValidSignature) {
                await cleanupFiles(req.files);
                return res.status(400).json({ success: false, message: 'Invalid file content. Uploaded file signature does not match its claimed type.' });
            }
        }

        const existingStudent = await Student.findOne({ email, admissionStatus: 'Pending' });
        if (existingStudent) {
            await cleanupFiles(req.files);
            return res.status(409).json({ success: false, message: 'An application with this email is already pending.' });
        }

        const documentsMetadata = req.files.map(file => ({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            storagePath: file.path
        }));

        const applicationNumber = await generateApplicationNumber();

        const student = new Student({
            fullName,
            email,
            phone,
            program,
            documents: documentsMetadata,
            applicationNumber,
            admissionStatus: 'Pending',
            accountStatus: 'inactive',
            role: 'student'
        });

        await student.save();

        const emailSent = await sendConfirmationEmail(email, fullName, applicationNumber);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            applicationNumber,
            emailSent
        });

    } catch (error) {
        await cleanupFiles(req.files);
        next(error);
    }
};

// 2. Student Account Setup (First time password creation via approval token)
const setupPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const student = await Student.findOne({
            activationToken: hashedToken,
            activationExpires: { $gt: Date.now() }
        }).select('+activationToken +activationExpires +password');

        if (!student) {
            return res.status(400).json({ success: false, message: 'Activation token is invalid or has expired' });
        }

        // Set password and activate account
        student.password = password;
        student.accountStatus = 'active';
        student.activationToken = undefined;
        student.activationExpires = undefined;

        await student.save();

        const jwtToken = generateToken(student._id, student.role || 'student');

        res.status(200).json({
            success: true,
            message: 'Password set successfully! Your account is now active.',
            token: jwtToken,
            student: {
                _id: student._id,
                fullName: student.fullName,
                email: student.email,
                studentId: student.studentId || student.applicationNumber,
                applicationNumber: student.applicationNumber,
                program: student.program,
                role: student.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// 3. Student Login
const loginStudent = async (req, res, next) => {
    try {
        const { studentId, password } = req.body;

        if (!studentId || !password) {
            return res.status(400).json({ success: false, message: 'Please provide your Student ID/Email and password' });
        }

        const rawIdentifier = studentId.trim();
        // Normalize both dashes and slashes for flexibility (e.g. JMC/2026/1550 -> JMC-2026-1550)
        const dashFormatted = rawIdentifier.replace(/\//g, '-');
        const slashFormatted = rawIdentifier.replace(/-/g, '/');

        const escapedRaw = rawIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedDash = dashFormatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedSlash = slashFormatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Search strictly by applicationNumber or studentId with flexible formats and case-insensitivity
        const student = await Student.findOne({
            $or: [
                { applicationNumber: { $regex: new RegExp(`^(${escapedRaw}|${escapedDash}|${escapedSlash})$`, 'i') } },
                { studentId: { $regex: new RegExp(`^(${escapedRaw}|${escapedDash}|${escapedSlash})$`, 'i') } }
            ]
        }).select('+password');

        if (!student) {
            return res.status(401).json({ success: false, message: 'Invalid Student ID or account not found' });
        }

        if (student.admissionStatus !== 'Approved') {
            return res.status(403).json({ 
                success: false, 
                message: `Your admission status is currently "${student.admissionStatus}". Only approved students can access the portal.` 
            });
        }

        if (student.accountStatus !== 'active' || !student.password) {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account is not yet activated. Please check your approval email for the activation link.' 
            });
        }

        const isMatch = await student.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(student._id, student.role || 'student');

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            _id: student._id,
            fullName: student.fullName,
            email: student.email,
            phone: student.phone,
            program: student.program,
            studentId: student.studentId || student.applicationNumber,
            applicationNumber: student.applicationNumber,
            admissionStatus: student.admissionStatus,
            profilePic: student.profilePic || null,
            role: student.role || 'student'
        });

    } catch (error) {
        next(error);
    }
};

// 4. Authenticated Student Profile (/api/students/me)
const getStudentProfile = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        res.status(200).json({
            _id: student._id,
            fullName: student.fullName,
            email: student.email,
            phone: student.phone,
            program: student.program,
            studentId: student.studentId || student.applicationNumber,
            applicationNumber: student.applicationNumber,
            admissionStatus: student.admissionStatus,
            accountStatus: student.accountStatus,
            role: student.role || 'student',
            profilePic: student.profilePic || null,
            documentsCount: student.documents ? student.documents.length : 0,
            dateApplied: student.createdAt,
            updatedAt: student.updatedAt
        });
    } catch (error) {
        next(error);
    }
};

// 5. Update Student Profile (Phone, etc.)
const updateStudentProfile = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const { phone, profilePic } = req.body;
        if (phone) student.phone = phone.trim();
        if (profilePic !== undefined) student.profilePic = profilePic;

        await student.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            student: {
                _id: student._id,
                fullName: student.fullName,
                email: student.email,
                phone: student.phone,
                program: student.program,
                studentId: student.studentId || student.applicationNumber,
                applicationNumber: student.applicationNumber,
                admissionStatus: student.admissionStatus,
                profilePic: student.profilePic
            }
        });
    } catch (error) {
        next(error);
    }
};

// 6. Change Password (In-Profile)
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
        }

        const student = await Student.findById(req.user.id).select('+password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const isMatch = await student.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        student.password = newPassword;
        await student.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// 7. Forgot Password (Initiate reset flow)
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide your registered email' });
        }

        const student = await Student.findOne({ email: email.trim().toLowerCase() }).select('+resetPasswordToken +resetPasswordExpires');

        // Always return safe generic message to prevent email enumeration
        if (!student) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with that email, a password reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        student.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        student.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        await student.save();

        const baseUrl = process.env.BASE_URL || 'https://medicalcareeracademy.ng';
        const resetLink = `${baseUrl}/reset-password.html?token=${resetToken}`;

        await sendPasswordResetEmail(student.email, student.fullName, resetLink);

        res.status(200).json({
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent.'
        });
    } catch (error) {
        next(error);
    }
};

// 8. Reset Password (Complete reset flow)
const resetPassword = async (req, res, next) => {
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

        const student = await Student.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires +password');

        if (!student) {
            return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
        }

        student.password = password;
        student.accountStatus = 'active';
        student.resetPasswordToken = undefined;
        student.resetPasswordExpires = undefined;

        await student.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.'
        });
    } catch (error) {
        next(error);
    }
};

// 9. Secure Document Download (Owner Only)
const getStudentDocument = async (req, res, next) => {
    try {
        const { docIndex } = req.params;
        const student = await Student.findById(req.user.id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const index = parseInt(docIndex, 10);
        if (isNaN(index) || index < 0 || !student.documents || index >= student.documents.length) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const doc = student.documents[index];
        const filePath = doc.storagePath;

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Document file is missing from server storage' });
        }

        res.download(filePath, doc.originalName, (err) => {
            if (err) {
                console.error('Error downloading student document:', err);
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerStudent,
    setupPassword,
    loginStudent,
    getStudentProfile,
    updateStudentProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getStudentDocument
};
