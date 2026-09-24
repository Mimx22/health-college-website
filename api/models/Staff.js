const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
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
        trim: true,
        default: ''
    },
    staffId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    department: {
        type: String,
        trim: true,
        default: 'General Health Sciences'
    },
    role: {
        type: String,
        enum: ['staff'],
        default: 'staff'
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    },
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// Method to verify password
staffSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash password if it was modified
staffSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
