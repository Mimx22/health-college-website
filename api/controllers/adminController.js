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

        const updatedApp = await Student.findByIdAndUpdate(
            req.params.id,
            { admissionStatus: status },
            { new: true, runValidators: true }
        );

        if (!updatedApp) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json(updatedApp);
    } catch (error) {
        next(error);
    }
};

const path = require('path');
const fs = require('fs');

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
        const filePath = path.resolve(doc.storagePath);

        // Verify the physical file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Physical file is missing from the server' });
        }

        // Send the file
        res.set('Content-Type', doc.mimeType);
        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
};

module.exports = { loginAdmin, getApplications, updateApplicationStatus, downloadDocument };
