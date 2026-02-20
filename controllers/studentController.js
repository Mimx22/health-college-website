const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerStudent = async (req, res) => {
    try {
        const { fullName, email, password, program } = req.body;
        const exists = await Student.findOne({ email });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const student = await Student.create({
            fullName, email, password: hashedPassword, program
        });
        res.status(201).json({ token: generateToken(student._id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({
            $or: [{ email: email.toLowerCase() }, { studentId: email.toUpperCase() }]
        });
        if (student && (await bcrypt.compare(password, student.password))) {
            res.json({
                _id: student._id, fullName: student.fullName, email: student.email,
                studentId: student.studentId, token: generateToken(student._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    res.json(req.student);
};

const updateProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.student._id);
        if (student) {
            student.email = req.body.email || student.email;
            student.phone = req.body.phone || student.phone;
            const updated = await student.save();
            res.json(updated);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerStudent, loginStudent, getMe, updateProfile };
