const express = require('express');
const router = express.Router();
const { upload, admissionUpload } = require('../middleware/uploadMiddleware');
const rateLimiter = require('../middleware/rateLimiter');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    registerStudent,
    setupPassword,
    loginStudent,
    getStudentProfile,
    updateStudentProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getStudentDocument
} = require('../controllers/studentController');

// Public endpoints
router.post('/register', rateLimiter(10), admissionUpload.array('documents', 6), registerStudent);
router.post('/login', rateLimiter(10), loginStudent);
router.post('/setup-password', rateLimiter(10), setupPassword);
router.post('/forgot-password', rateLimiter(5), forgotPassword);
router.post('/reset-password/:token', rateLimiter(10), resetPassword);

// Authenticated student endpoints
router.get('/me', protect, authorizeRoles('student'), getStudentProfile);
router.put('/me', protect, authorizeRoles('student'), updateStudentProfile);
router.put('/change-password', protect, authorizeRoles('student'), changePassword);
router.get('/documents/:docIndex', protect, authorizeRoles('student'), getStudentDocument);

module.exports = router;
