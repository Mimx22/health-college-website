const Student = require('../models/Student');
const fs = require('fs');
const { isValidMagicBytes } = require('../utils/magicBytes');

// Helper to clean up uploaded files on error
const cleanupFiles = (files) => {
    if (!files || !Array.isArray(files)) return;
    files.forEach(file => {
        if (fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (err) {
                console.error(`Failed to delete file ${file.path}:`, err);
            }
        }
    });
};

const generateApplicationNumber = async () => {
    const year = new Date().getFullYear();
    let isUnique = false;
    let appNumber;
    
    // Safety limit to prevent infinite loops
    let attempts = 0;
    while (!isUnique && attempts < 10) {
        // Generate a 6-digit random number
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

const registerStudent = async (req, res, next) => {
    try {
        // 1. Exactly 6 Documents Validation
        if (!req.files || req.files.length !== 6) {
            cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'Exactly 6 documents are required.' });
        }

        // 1.5. Magic Byte Validation
        for (const file of req.files) {
            if (!isValidMagicBytes(file.path, file.mimetype)) {
                cleanupFiles(req.files);
                return res.status(400).json({ success: false, message: `File ${file.originalname} failed signature validation. Ensure it is a valid PDF, JPG, or PNG.` });
            }
        }

        // 2. Extract and Validate Input Fields
        let { fullName, email, phone, program } = req.body;
        
        fullName = fullName ? fullName.trim() : '';
        email = email ? email.trim().toLowerCase() : '';
        phone = phone ? phone.trim() : '';
        program = program ? program.trim() : '';

        if (!fullName) {
            cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'Full name is required.' });
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'A valid email is required.' });
        }
        // Basic reasonable Nigerian phone validation, length >= 10
        if (!phone || phone.length < 10) {
            cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'A valid phone number is required.' });
        }
        if (!program) {
            cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'Program is required.' });
        }

        // 3. Duplicate Application Policy
        const existingStudent = await Student.findOne({ email, admissionStatus: 'Pending' });
        if (existingStudent) {
            cleanupFiles(req.files);
            return res.status(409).json({ success: false, message: 'An application with this email is already pending.' });
        }

        // 4. Map Documents Metadata
        const documentsMetadata = req.files.map(file => ({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            storagePath: file.path
        }));

        // 5. Generate Application Number
        const applicationNumber = await generateApplicationNumber();

        // 6. Save Application
        const student = new Student({
            fullName,
            email,
            phone,
            program,
            documents: documentsMetadata,
            applicationNumber,
            admissionStatus: 'Pending'
        });

        await student.save();

        // 7. Send Confirmation Email (Do not await tightly to avoid failing response if SMTP is down, but we will await to log it or handle cleanly)
        const { sendConfirmationEmail } = require('../utils/emailService');
        const emailSent = await sendConfirmationEmail(email, fullName, applicationNumber);

        // 8. Return Clean Success Response
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            applicationNumber,
            emailSent
        });

    } catch (error) {
        // Transaction safety: if saving fails, cleanup uploaded files
        cleanupFiles(req.files);
        next(error);
    }
};

const loginStudent = async (req, res, next) => {
    try {
        // Implementation for student login goes here (Deferred to future mission)
        res.status(200).json({ success: true, message: 'Student login endpoint placeholder' });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerStudent, loginStudent };
