const Student = require('../models/Student');

const approveStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        student.admissionStatus = 'Approved';
        // Logic for generating studentId can go here too
        await student.save();
        res.json({ message: 'Student approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { approveStudent, getAllStudents };
