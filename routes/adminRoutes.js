const express = require('express');
const router = express.Router();
const { getAllApplications, updateApplicationStatus } = require('../controllers/adminController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Get all applications (Admin only)
router.get('/applications', authMiddleware, authorizeRoles('admin'), getAllApplications);

// Update application status (Admin only)
router.put('/applications/:id/status', authMiddleware, authorizeRoles('admin'), updateApplicationStatus);

module.exports = router;
