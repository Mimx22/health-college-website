const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new student
// @route   POST /api/students/register
// @access  Public
const registerStudent = async (req, res, next) => {
    try {
        const { fullName, email, phone, program } = req.body;

        // Handle file uploads
        const documents = req.files ? req.files.map(file => file.path) : [];

        // Check if student exists
        const studentExists = await Student.findOne({ email });
        if (studentExists) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        // Use phone number as the initial temporary password
        const tempPass = phone;

        // Hash the generated password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPass, salt);

        // Create student
        const student = await Student.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
            tempPass,  // Store plain-text for admission letter
            program,
            documents
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
        const { studentId, email, password } = req.body;

        let student;

        if (studentId) {
            // Student portal login — look up by assigned Student ID
            student = await Student.findOne({ studentId });
            if (!student) {
                return res.status(401).json({ message: 'Student ID not found. Make sure your application has been approved.' });
            }
        } else if (email) {
            // Admin/staff login — look up by email
            student = await Student.findOne({ email });
        }

        if (student && (await bcrypt.compare(password, student.password))) {
            const payload = { id: student._id, role: student.role };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.json({
                _id: student._id,
                fullName: student.fullName,
                email: student.email,
                admissionStatus: student.admissionStatus,
                program: student.program,
                role: student.role,
                token,
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

// @desc    Get all students (admin)
// @route   GET /api/students
// @access  Private (admin)
const getAllStudents = async (req, res, next) => {
    try {
        const students = await Student.find({}).select('-password');
        res.json(students);
    } catch (error) {
        next(error);
    }
};

// @desc    Get currently logged-in student
// @route   GET /api/students/me
// @access  Private (student)
const getMe = async (req, res, next) => {
    try {
        if (!req.student) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        res.json(req.student);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerStudent,
    loginStudent,
    updateProfile
    , approveStudent
    , getAllStudents
    , getMe
};
