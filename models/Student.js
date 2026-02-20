const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    admissionStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    program: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true // Only unique when set
    },
    tempPass: {
        type: String  // Set by backend on registration; no default
    },
    documents: [{
        type: String // Paths to uploaded files
    }],
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', studentSchema);
