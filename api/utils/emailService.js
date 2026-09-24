const nodemailer = require('nodemailer');

const createTransporter = () => {
    const host = process.env.SMTP_HOST || 'mail.medicalcareeracademy.ng';
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    const user = process.env.SMTP_USER || 'admissions@medicalcareeracademy.ng';
    const pass = process.env.SMTP_PASS || '$Miracle2255';

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
            user: user,
            pass: pass,
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000
    });
};

const getSenderEmail = () => {
    return process.env.SMTP_FROM || '"Jos Medical College" <admissions@medicalcareeracademy.ng>';
};

const sendConfirmationEmail = async (toEmail, fullName, applicationNumber) => {
    try {
        const transporter = createTransporter();
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #0b2046; border-bottom: 2px solid #0b2046; padding-bottom: 10px;">Application Received</h2>
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>Thank you for applying to the <strong>Medical Career College of Health Science and Technology, Jos</strong>.</p>
                <p>We have successfully received your application. Your application number is:</p>
                <div style="background: #f4f6f9; border-left: 4px solid #0b2046; padding: 12px 18px; margin: 15px 0; font-size: 1.2rem; font-weight: bold; letter-spacing: 1px;">
                    ${applicationNumber}
                </div>
                <p>Please keep this number safe as you will need it to track your admission status on our portal.</p>
                <br>
                <p>Best Regards,<br><strong>Admissions Team</strong><br>Jos Medical College</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: getSenderEmail(),
            to: toEmail,
            subject: 'Application Received - Jos Medical College',
            html
        });
        console.log(`Confirmation email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send confirmation email:', error.message);
        return false;
    }
};

const sendApprovalEmail = async (toEmail, fullName, applicationNumber, program, activationLink) => {
    try {
        const transporter = createTransporter();
        const setupButton = activationLink ? `
            <div style="margin: 25px 0; text-align: center;">
                <a href="${activationLink}" style="background-color: #0b2046; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Activate Student Account & Set Password
                </a>
            </div>
            <p style="font-size: 0.85rem; color: #666;">Or copy and paste this link into your browser:<br><a href="${activationLink}">${activationLink}</a></p>
            <p style="font-size: 0.85rem; color: #888;">Note: This setup link is valid for 24 hours.</p>
        ` : '';

        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #1b5e20; border-bottom: 2px solid #1b5e20; padding-bottom: 10px;">🎉 Congratulations! You have been Admitted</h2>
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>We are delighted to inform you that your application (<strong>${applicationNumber}</strong>) for the <strong>${program}</strong> program has been <strong style="color: #1b5e20;">APPROVED</strong>.</p>
                <p>Welcome to the <strong>Medical Career College of Health Science and Technology, Jos</strong>.</p>
                <p>To access your Student Portal, download your admission letter, and view your academic schedule, please activate your student account below:</p>
                ${setupButton}
                <br>
                <p>Best Regards,<br><strong>Admissions Team</strong><br>Jos Medical College</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: getSenderEmail(),
            to: toEmail,
            subject: 'Admission Approved & Account Setup - Jos Medical College',
            html
        });
        console.log(`Approval email with activation link sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send approval email:', error.message);
        return false;
    }
};

const sendRejectionEmail = async (toEmail, fullName, applicationNumber) => {
    try {
        const transporter = createTransporter();
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #b71c1c; border-bottom: 2px solid #b71c1c; padding-bottom: 10px;">Application Status Update</h2>
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>Thank you for your application (${applicationNumber}) to the <strong>Medical Career College of Health Science and Technology, Jos</strong>.</p>
                <p>After careful review of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
                <p>We appreciate your interest in our institution and wish you the best in your future academic endeavors.</p>
                <br>
                <p>Best Regards,<br><strong>Admissions Team</strong><br>Jos Medical College</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: getSenderEmail(),
            to: toEmail,
            subject: 'Application Status Update - Jos Medical College',
            html
        });
        console.log(`Rejection email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send rejection email:', error.message);
        return false;
    }
};

const sendPasswordResetEmail = async (toEmail, fullName, resetLink) => {
    try {
        const transporter = createTransporter();
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #0b2046; border-bottom: 2px solid #0b2046; padding-bottom: 10px;">Password Reset Request</h2>
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>We received a request to reset the password for your student portal account.</p>
                <div style="margin: 25px 0; text-align: center;">
                    <a href="${resetLink}" style="background-color: #0b2046; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Reset Your Password
                    </a>
                </div>
                <p style="font-size: 0.85rem; color: #666;">Or copy and paste this link into your browser:<br><a href="${resetLink}">${resetLink}</a></p>
                <p style="font-size: 0.85rem; color: #888;">Note: This link is valid for 1 hour. If you did not request this, you can safely ignore this email.</p>
                <br>
                <p>Best Regards,<br><strong>ICT Support</strong><br>Jos Medical College</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: getSenderEmail(),
            to: toEmail,
            subject: 'Password Reset Request - Jos Medical College',
            html
        });
        console.log(`Password reset email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send password reset email:', error.message);
        return false;
    }
};

const sendContactEmail = async (fullName, email, phone, subject, message) => {
    try {
        const transporter = createTransporter();
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0b2046;">New Contact Form Message</h2>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: getSenderEmail(),
            to: process.env.CONTACT_RECIPIENT_EMAIL,
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            html
        });
        console.log(`Contact email sent from ${email}`);
        return true;
    } catch (error) {
        console.error('Failed to send contact email:', error.message);
        return false;
    }
};

const sendStaffPasswordResetEmail = async (toEmail, fullName, resetLink) => {
    try {
        const transporter = createTransporter();
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #0b2046; border-bottom: 2px solid #0b2046; padding-bottom: 10px;">Staff Password Reset Request</h2>
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>We received a request to reset the password for your Teaching Staff Portal account.</p>
                <div style="margin: 25px 0; text-align: center;">
                    <a href="${resetLink}" style="background-color: #0b2046; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Reset Staff Password
                    </a>
                </div>
                <p style="font-size: 0.85rem; color: #666;">Or copy and paste this link into your browser:<br><a href="${resetLink}">${resetLink}</a></p>
                <p style="font-size: 0.85rem; color: #888;">Note: This link is valid for 1 hour. If you did not request this, you can safely ignore this email.</p>
                <br>
                <p>Best Regards,<br><strong>ICT Support / Office of the Dean</strong><br>Jos Medical College</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: getSenderEmail(),
            to: toEmail,
            subject: 'Staff Password Reset - Jos Medical College',
            html
        });
        console.log(`Staff password reset email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send staff password reset email:', error.message);
        return false;
    }
};

module.exports = {
    sendConfirmationEmail,
    sendApprovalEmail,
    sendRejectionEmail,
    sendPasswordResetEmail,
    sendStaffPasswordResetEmail,
    sendContactEmail
};
