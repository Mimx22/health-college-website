const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendConfirmationEmail = async (toEmail, fullName, applicationNumber) => {
    try {
        const transporter = createTransporter();
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0b2046;">Application Received</h2>
                <p>Dear ${fullName},</p>
                <p>Thank you for applying to the Medical Career College of Health Science and Technology, Jos.</p>
                <p>We have successfully received your application. Your application number is:</p>
                <h3 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 2px;">${applicationNumber}</h3>
                <p>Please keep this number safe as you will need it to check your admission status on our portal.</p>
                <p>Best Regards,<br>Jos Medical College Admissions Team</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
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

const sendApprovalEmail = async (toEmail, fullName, applicationNumber, program) => {
    try {
        const transporter = createTransporter();
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1b5e20;">Congratulations! You have been Admitted</h2>
                <p>Dear ${fullName},</p>
                <p>We are delighted to inform you that your application (<strong>${applicationNumber}</strong>) for the <strong>${program}</strong> program has been <strong>APPROVED</strong>.</p>
                <p>Welcome to the Medical Career College of Health Science and Technology, Jos. Please log into the portal for further instructions regarding your registration and resumption date.</p>
                <p>Best Regards,<br>Jos Medical College Admissions Team</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: toEmail,
            subject: 'Admission Approved - Jos Medical College',
            html
        });
        console.log(`Approval email sent to ${toEmail}`);
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
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #b71c1c;">Application Update</h2>
                <p>Dear ${fullName},</p>
                <p>Thank you for applying to the Medical Career College of Health Science and Technology, Jos.</p>
                <p>After careful review of your application (${applicationNumber}), we regret to inform you that we are unable to offer you admission at this time.</p>
                <p>We appreciate your interest in our institution and wish you the best in your future academic endeavors.</p>
                <p>Best Regards,<br>Jos Medical College Admissions Team</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
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

module.exports = {
    sendConfirmationEmail,
    sendApprovalEmail,
    sendRejectionEmail
};
