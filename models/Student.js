const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentId: { type: String, unique: true },
    phone: String,
    program: String,
    admissionStatus: { type: String, default: 'Pending' },
    profilePic: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
