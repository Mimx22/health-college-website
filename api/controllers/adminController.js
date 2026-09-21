const Admin = require('../models/Admin');
const Student = require('../models/Student');
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

        // Spam Protection: Query the current state first
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // If the status is the same, do nothing and return immediately (avoids duplicate emails)
        if (student.admissionStatus === status) {
            return res.status(200).json(student);
        }

        student.admissionStatus = status;
        const updatedApp = await student.save();

        // Send Email Notification
        const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');
        let emailSent = false;
        
        if (status === 'Approved') {
            emailSent = await sendApprovalEmail(updatedApp.email, updatedApp.fullName, updatedApp.applicationNumber, updatedApp.program);
        } else if (status === 'Rejected') {
            emailSent = await sendRejectionEmail(updatedApp.email, updatedApp.fullName, updatedApp.applicationNumber);
        }

        // We convert to lean-like object to append emailSent flag cleanly
        const responseApp = updatedApp.toObject();
        responseApp.emailSent = emailSent;

        res.status(200).json(responseApp);
    } catch (error) {
        next(error);
    }
};

const https = require('https');

const downloadDocument = async (req, res, next) => {
    try {
        const { id, docIndex } = req.params;
        
        // Find the application
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Validate index
        const index = parseInt(docIndex, 10);
        if (isNaN(index) || index < 0 || !student.documents || index >= student.documents.length) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const doc = student.documents[index];
        const fileUrl = doc.storagePath; // Cloudinary secure URL

        // Proxy the file from Cloudinary to the Admin securely
        https.get(fileUrl, (proxyRes) => {
            if (proxyRes.statusCode !== 200) {
                return res.status(proxyRes.statusCode).json({ success: false, message: 'Failed to fetch document from cloud storage' });
            }
            
            res.set('Content-Type', doc.mimeType);
            // We set Content-Disposition inline to allow viewing in browser
            res.set('Content-Disposition', `inline; filename="${doc.originalName}"`);
            
            proxyRes.pipe(res);
        }).on('error', (err) => {
            console.error('Error fetching document from Cloudinary:', err);
            res.status(500).json({ success: false, message: 'Server error while fetching document' });
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { loginAdmin, getApplications, updateApplicationStatus, downloadDocument };
