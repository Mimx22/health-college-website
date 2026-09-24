const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    loginStaff,
    getStaffProfile,
    updateStaffProfile,
    changeStaffPassword,
    forgotStaffPassword,
    resetStaffPassword,
    getStaffApplications,
    viewStudentDocument
} = require('../controllers/staffController');

// Public endpoints (rate-limited)
router.post('/login', rateLimiter(10), loginStaff);
router.post('/forgot-password', rateLimiter(5), forgotStaffPassword);
router.post('/reset-password/:token', rateLimiter(10), resetStaffPassword);

// Authenticated staff endpoints
router.get('/me', protect, authorizeRoles('staff'), getStaffProfile);
router.put('/me', protect, authorizeRoles('staff'), updateStaffProfile);
router.put('/change-password', protect, authorizeRoles('staff'), changeStaffPassword);
router.get('/applications', protect, authorizeRoles('staff'), getStaffApplications);
router.get('/applications/:id/documents/:docIndex', protect, authorizeRoles('staff'), viewStudentDocument);

module.exports = router;
