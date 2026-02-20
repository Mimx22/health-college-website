const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');

// ── Helper ────────────────────────────────────────────────────────────────────
const hashToken = (raw) =>
    crypto.createHash('sha256').update(raw).digest('hex');

// @desc   Request a password-reset link
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res, next) => {
    try {
        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        console.log(`🔑 Forgot-password request for ID: "${studentId}"`);

        // Try studentId first, then fall back to email for flexibility
        let user = await Student.findOne({ studentId: studentId.trim().toUpperCase() });

        if (!user) {
            // Fallback: maybe they entered their email by mistake
            user = await Student.findOne({ email: studentId.trim().toLowerCase() });
        }

        // ── Security: always return success so we don't leak information ──────
        if (!user || !user.email) {
            console.log(`⚠️  No student found for: "${studentId}"`);
            return res.status(200).json({
                message: 'If that Student ID is registered, a reset link has been sent to your email.'
            });
        }

        console.log(`✅ Student found: ${user.fullName} <${user.email}>`);

        // Generate raw token (sent in email) and hashed token (stored in DB)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashed = hashToken(rawToken);

        user.resetPasswordToken = hashed;
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Build reset URL using the raw token
        const frontendUrl = process.env.PORTAL_URL || 'http://localhost:5000';
        const resetUrl = `${frontendUrl}/reset-password.html?token=${rawToken}`;

        const html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <div style="background: #00a8e8; padding: 24px 32px;">
                    <h2 style="color: #fff; margin: 0; font-size: 1.4rem;">JMC Password Reset</h2>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #334155; font-size: 1rem;">Hi <strong>${user.fullName}</strong>,</p>
                    <p style="color: #475569; line-height: 1.6;">
                        We received a request to reset the password for your account
                        (<strong>${user.studentId || user.email}</strong>).
                        Click the button below to set a new password.
                        This link expires in <strong>1 hour</strong>.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}"
                           style="background: #00a8e8; color: #fff; text-decoration: none;
                                  padding: 14px 32px; border-radius: 8px; font-weight: 600;
                                  font-size: 1rem; display: inline-block;">
                           Reset My Password
                        </a>
                    </div>
                    <p style="color: #94a3b8; font-size: 0.85rem; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                        If you did not request this, you can safely ignore this email.<br>
                        This link will expire at ${new Date(user.resetPasswordExpire).toLocaleTimeString()}.
                    </p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'JMC Password Reset Request',
            html
        });

        console.log(`✉️  Reset email dispatched to ${user.email}`);

        return res.status(200).json({
            message: 'If that Student ID is registered, a reset link has been sent to your email.'
        });

    } catch (err) {
        console.error('forgotPassword error:', err);
        next(err);
    }
};

// @desc   Reset password using token from email link
// @route  POST /api/auth/reset-password/:token
// @access Public
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Hash the raw token from the URL to compare with what's in the DB
        const hashed = hashToken(token);

        const user = await Student.findOne({
            resetPasswordToken: hashed,
            resetPasswordExpire: { $gt: Date.now() }   // not yet expired
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired reset link. Please request a new one.'
            });
        }

        // Hash the new password and clear the reset fields
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful. You can now log in.' });

    } catch (err) {
        console.error('resetPassword error:', err);
        next(err);
    }
};

module.exports = { forgotPassword, resetPassword };
