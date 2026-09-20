const mongoose = require('mongoose');

function arrayLimit(val) {
  return val.length === 6;
}

const documentSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true }
}, { _id: false });

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    program: {
        type: String,
        required: [true, 'Program is required'],
        trim: true
    },
    applicationNumber: {
        type: String,
        unique: true,
        sparse: true, // in case there are records without it before it's assigned
        index: true
    },
    documents: {
        type: [documentSchema],
        validate: [arrayLimit, '{PATH} must have exactly 6 documents']
    },
    admissionStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    studentId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
