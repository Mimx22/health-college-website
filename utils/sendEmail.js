const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer with Gmail.
 *
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html    - Email body as HTML string
 * @returns {Promise<void>}
 */
const sendEmail = async ({ to, subject, html }) => {
    // Create a transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Your Gmail address
            pass: process.env.EMAIL_PASS   // Gmail App Password (not your login password)
        }
    });

    const mailOptions = {
        from: `"Jos Medical College" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    };

    // Will throw if sending fails — caller handles the error
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
};

module.exports = sendEmail;
