const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// @desc    Register a new student
// @route   POST /api/students/register
// @access  Public
const registerStudent = async (req, res, next) => {
    try {
        const { fullName, email, phone, password, program } = req.body;

        // Check if student exists
        const studentExists = await Student.findOne({ email });
        if (studentExists) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create student
        const student = await Student.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
            program
        });

        if (student) {
            res.status(201).json({
                _id: student._id,
                fullName: student.fullName,
                email: student.email,
                admissionStatus: student.admissionStatus,
                program: student.program,
                message: 'Registration successful'
            });
        } else {
            res.status(400).json({ message: 'Invalid student data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate student & login
// @route   POST /api/students/login
// @access  Public
const loginStudent = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for student email
        const student = await Student.findOne({ email });

        if (student && (await bcrypt.compare(password, student.password))) {
            res.json({
                _id: student._id,
                fullName: student.fullName,
                email: student.email,
                admissionStatus: student.admissionStatus,
                program: student.program,
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (requires student ID in request body)
const updateProfile = async (req, res, next) => {
    try {
        const { email, phone, profilePic } = req.body;

        // Find student by email
        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update fields
        if (phone) student.phone = phone;
        if (profilePic) student.profilePic = profilePic;

        const updatedStudent = await student.save();

        res.json({
            _id: updatedStudent._id,
            fullName: updatedStudent.fullName,
            email: updatedStudent.email,
            phone: updatedStudent.phone,
            admissionStatus: updatedStudent.admissionStatus,
            program: updatedStudent.program,
            profilePic: updatedStudent.profilePic,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve a student's admission (admin)
// @route   PATCH /api/students/:id/approve
// @access  Private (admin)
const approveStudent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.admissionStatus === 'approved') {
            return res.status(400).json({ message: 'Student already approved' });
        }

        student.admissionStatus = 'approved';
        const updatedStudent = await student.save();

        res.json({
            _id: updatedStudent._id,
            fullName: updatedStudent.fullName,
            email: updatedStudent.email,
            phone: updatedStudent.phone,
            admissionStatus: updatedStudent.admissionStatus,
            program: updatedStudent.program,
            message: 'Student approved successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerStudent,
    loginStudent,
    updateProfile
    ,approveStudent
};
