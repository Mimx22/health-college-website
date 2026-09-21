const Student = require('../models/Student');
const fs = require('fs');

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
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'Exactly 6 documents are required.' });
        }

        // Note: Magic byte validation is now handled automatically by Cloudinary's allowed_formats and resource type checks.

        // 2. Extract and Validate Input Fields
        let { fullName, email, phone, program } = req.body;
        
        fullName = fullName ? fullName.trim() : '';
        email = email ? email.trim().toLowerCase() : '';
        phone = phone ? phone.trim() : '';
        program = program ? program.trim() : '';

        if (!fullName) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'Full name is required.' });
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'A valid email is required.' });
        }
        // Basic reasonable Nigerian phone validation, length >= 10
        if (!phone || phone.length < 10) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'A valid phone number is required.' });
        }
        if (!program) {
            await cleanupFiles(req.files);
            return res.status(400).json({ success: false, message: 'Program is required.' });
        }

        // 3. Duplicate Application Policy
        const existingStudent = await Student.findOne({ email, admissionStatus: 'Pending' });
        if (existingStudent) {
            await cleanupFiles(req.files);
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
        await cleanupFiles(req.files);
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
