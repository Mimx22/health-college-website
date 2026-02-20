const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all student applications (for admin dashboard)
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getAllApplications = async (req, res, next) => {
    try {
        const students = await Student.find({}).sort({ createdAt: -1 });

        // Map to format expected by frontend
        const applications = students.map(student => ({
            _id: student._id,
            fullName: student.fullName,
            email: student.email,
            program: student.program,
            phone: student.phone,
            dateApplied: student.createdAt,
            admissionStatus: student.admissionStatus === 'pending' ? 'Pending' :
                student.admissionStatus === 'approved' ? 'Approved' : 'Rejected',
            studentId: student.studentId || null,
            tempPass: student.tempPass,
            documents: student.documents || []
        }));

        res.json(applications);
    } catch (error) {
        next(error);
    }
};

// @desc    Update application status (Approve / Reject)
// @route   PUT /api/admin/applications/:id/status
// @access  Private (Admin)
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expects 'Approved' or 'Rejected'

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Map frontend status 'Approved'/'Rejected' → backend enum 'approved'/'rejected'
        if (status === 'Approved') {
            student.admissionStatus = 'approved';

            // Generate a short, readable Student ID if not already assigned
            if (!student.studentId) {
                const year = new Date().getFullYear();
                const count = await Student.countDocuments({ admissionStatus: 'approved' });
                student.studentId = `JMC/${year}/${String(count + 1).padStart(3, '0')}`;
            }
        } else if (status === 'Rejected') {
            student.admissionStatus = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid status. Use "Approved" or "Rejected".' });
        }

        const updatedStudent = await student.save();

        // --- Send Email Notification (non-blocking) ---
        if (status === 'Approved') {
            // Fire-and-forget: never crash the server if email fails
            sendEmail({
                to: updatedStudent.email,
                subject: 'Admission Approved - Jos Medical College',
                html: buildApprovalEmail(updatedStudent)
            }).catch(err => {
                // Log the failure but let the API response succeed
                console.error(`⚠️  Failed to send approval email to ${updatedStudent.email}:`, err.message);
            });
        }

        res.json({
            _id: updatedStudent._id,
            fullName: updatedStudent.fullName,
            email: updatedStudent.email,
            program: updatedStudent.program,
            admissionStatus: status,
            studentId: updatedStudent.studentId,
            tempPass: updatedStudent.tempPass,
            message: `Application ${status} successfully`
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Builds the HTML body for the admission approval email.
 * @param {Object} student - The approved student Mongoose document
 * @returns {string} HTML string
 */
function buildApprovalEmail(student) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admission Approved</title>
    </head>
    <body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9;">

        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #00a8e8, #005f8e); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">
                🏥 JOS MEDICAL COLLEGE
            </h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; letter-spacing: 0.5px;">
                OF HEALTH SCIENCE AND TECHNOLOGY
            </p>
        </div>

        <!-- Main Content -->
        <div style="max-width: 600px; margin: 0 auto; padding: 32px 24px;">

            <div style="background: #ffffff; border-radius: 12px; padding: 36px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border-top: 4px solid #00a8e8;">

                <!-- Congratulations Badge -->
                <div style="text-align: center; margin-bottom: 28px;">
                    <span style="background: #e8f8f0; color: #1a9e5c; font-weight: 700; font-size: 13px; padding: 6px 16px; border-radius: 20px; letter-spacing: 0.5px;">
                        ✅ ADMISSION APPROVED
                    </span>
                </div>

                <p style="color: #333; font-size: 16px; margin: 0 0 8px;">Dear <strong>${student.fullName}</strong>,</p>

                <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                    Congratulations! We are pleased to inform you that your application to
                    <strong>Jos Medical College of Health Science and Technology</strong> has been
                    <strong style="color: #1a9e5c;">officially approved</strong> for the
                    <strong>2026/2027 academic session</strong>.
                </p>

                <!-- Student Details Card -->
                <div style="background: #f0f8ff; border-radius: 8px; padding: 24px; margin: 0 0 28px; border-left: 4px solid #00a8e8;">
                    <h3 style="margin: 0 0 16px; color: #005f8e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                        Your Admission Details
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #777; font-size: 13px; width: 140px;">Full Name</td>
                            <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">${student.fullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #777; font-size: 13px;">Student ID</td>
                            <td style="padding: 8px 0; color: #00a8e8; font-weight: 700; font-size: 16px; letter-spacing: 1px;">${student.studentId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #777; font-size: 13px;">Programme</td>
                            <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">${student.program}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #777; font-size: 13px;">Session</td>
                            <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">2026/2027</td>
                        </tr>
                    </table>
                </div>

                <!-- Portal Access Instructions -->
                <div style="background: #fffbf0; border-radius: 8px; padding: 20px; margin: 0 0 28px; border-left: 4px solid #f5a623;">
                    <h3 style="margin: 0 0 12px; color: #b07d1a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                        🔐 How to Access Your Student Portal
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 2;">
                        <li>Visit the college portal</li>
                        <li>Enter your <strong>Student ID</strong>: <code style="background:#f0f0f0; padding: 2px 6px; border-radius: 4px;">${student.studentId}</code></li>
                        <li>Enter your <strong>phone number</strong> as your initial password</li>
                        <li>Change your password on first login</li>
                    </ol>
                </div>

                <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                    Please keep this email for your records. Your <strong>Student ID</strong> is your
                    unique identifier throughout your time at JMC. For any enquiries, please contact
                    our admissions office.
                </p>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${process.env.PORTAL_URL || 'http://localhost:5000'}/student-login.html"
                       style="display: inline-block; background: linear-gradient(135deg, #00a8e8, #005f8e);
                              color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none;
                              font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">
                        Access Student Portal →
                    </a>
                </div>

                <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0;">
                    We look forward to welcoming you into our institution.
                    <br><br>
                    Warm regards,<br>
                    <strong style="color: #005f8e;">The Admissions Office</strong><br>
                    <span style="color: #999; font-size: 13px;">Jos Medical College of Health Science and Technology</span>
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px 24px; color: #aaa; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Jos Medical College. All rights reserved.</p>
            <p style="margin: 6px 0 0;">No.2 Rikkos, Jos, Plateau State, Nigeria</p>
        </div>

    </body>
    </html>
    `;
}

module.exports = {
    getAllApplications,
    updateApplicationStatus
};
