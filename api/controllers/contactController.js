const { sendContactEmail } = require('../utils/emailService');
const Contact = require('../models/Contact');

// Helper to escape HTML to prevent injection
const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
};

const submitContactForm = async (req, res, next) => {
    try {

        // 1. Extract and Validate Input
        let { fullName, email, phone, subject, message } = req.body;
        
        fullName = fullName ? fullName.trim() : '';
        email = email ? email.trim().toLowerCase() : '';
        phone = phone ? phone.trim() : '';
        subject = subject ? subject.trim() : '';
        message = message ? message.trim() : '';

        // Enforce required fields
        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Please fill out all required fields.' });
        }

        // Enforce valid email
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'A valid email address is required.' });
        }

        // Enforce length limits (Security)
        if (fullName.length > 100) return res.status(400).json({ success: false, message: 'Name is too long.' });
        if (subject.length > 200) return res.status(400).json({ success: false, message: 'Subject is too long.' });
        if (message.length > 2000) return res.status(400).json({ success: false, message: 'Message exceeds maximum length.' });

        // Sanitize message to prevent HTML/script injection
        const safeMessage = escapeHTML(message);
        const safeSubject = escapeHTML(subject);

        // 2. Save Contact Message to MongoDB Fallback Database
        const contactDoc = await Contact.create({
            fullName,
            email,
            phone,
            subject: safeSubject,
            message: safeMessage,
            emailSent: false
        });

        // 3. Attempt Email Dispatch via SMTP
        let emailSent = false;
        try {
            emailSent = await sendContactEmail(fullName, email, phone, safeSubject, safeMessage);
            if (emailSent) {
                contactDoc.emailSent = true;
                await contactDoc.save();
            }
        } catch (emailErr) {
            console.error('Contact email dispatch failed:', emailErr.message);
        }

        // Return success response to user (message is safely recorded in database)
        res.status(200).json({ 
            success: true, 
            message: 'Your message has been received! We will get back to you shortly.',
            emailSent
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { submitContactForm };
