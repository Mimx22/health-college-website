const Admin = require('../models/Admin');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const Contact = require('../models/Contact');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');

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

        const cleanEmail = email.trim().toLowerCase();
        const admin = await Admin.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });

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
        // Fetch all applications, newest first
        const apps = await Student.find({}).sort({ createdAt: -1 }).lean();
        
        // Map createdAt to dateApplied for frontend compatibility
        const mappedApps = apps.map(app => ({
            ...app,
            dateApplied: app.createdAt
        }));

        res.status(200).json(mappedApps);
    } catch (error) {
        next(error);
    }
};

const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Approved', 'Rejected'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value provided' });
        }

        // Query current state
        const student = await Student.findById(req.params.id).select('+activationToken +activationExpires');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // If the status is the same and already processed, avoid duplicate email
        if (student.admissionStatus === status) {
            return res.status(200).json(student);
        }

        student.admissionStatus = status;

        let emailSent = false;
        let activationToken = null;

        if (status === 'Approved') {
            // Assign studentId if not already present
            if (!student.studentId) {
                student.studentId = student.applicationNumber; // Or use assigned matric number
            }
            
            // Generate secure one-time activation token valid for 24h
            activationToken = crypto.randomBytes(32).toString('hex');
            student.activationToken = crypto.createHash('sha256').update(activationToken).digest('hex');
            student.activationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

            await student.save();

            // Build activation link
            const baseUrl = process.env.BASE_URL || 'https://medicalcareeracademy.ng';
            const activationLink = `${baseUrl}/reset-password.html?token=${activationToken}&setup=true`;

            emailSent = await sendApprovalEmail(
                student.email,
                student.fullName,
                student.applicationNumber,
                student.program,
                activationLink
            );
        } else if (status === 'Rejected') {
            await student.save();
            emailSent = await sendRejectionEmail(
                student.email,
                student.fullName,
                student.applicationNumber
            );
        } else {
            await student.save();
        }

        const responseApp = student.toObject();
        responseApp.emailSent = emailSent;
        // Never leak tokens in the response
        delete responseApp.activationToken;
        delete responseApp.activationExpires;
        delete responseApp.password;

        res.status(200).json(responseApp);
    } catch (error) {
        next(error);
    }
};

const downloadDocument = async (req, res, next) => {
    try {
        const { id, docIndex } = req.params;
        
        // Ensure id is a valid 24-character hexadecimal ObjectId
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid application ID format' });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Application not found' });
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
                console.error("Error downloading file:", err);
            }
        });

    } catch (error) {
        next(error);
    }
};

const getContactMessages = async (req, res, next) => {
    try {
        const messages = await Contact.find({}).sort({ createdAt: -1 }).lean();
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

const setStudentPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const student = await Student.findById(id).select('+password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student application not found' });
        }

        student.password = password;
        student.accountStatus = 'active';
        if (!student.studentId) {
            student.studentId = student.applicationNumber;
        }

        await student.save();

        res.status(200).json({
            success: true,
            message: `Password successfully set for ${student.fullName}. Account is now active.`,
            studentId: student.studentId || student.applicationNumber,
            fullName: student.fullName,
            email: student.email
        });
    } catch (error) {
        next(error);
    }
};

const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please select a file to upload' });
        }

        // Return relative path accessible via web
        const fileUrl = `/api/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            fileUrl,
            imageUrl: fileUrl,
            videoUrl: fileUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { loginAdmin, getApplications, updateApplicationStatus, downloadDocument, getContactMessages, setStudentPassword, uploadImage };

