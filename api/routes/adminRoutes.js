const express = require('express');
const router = express.Router();
const { loginAdmin, getApplications, updateApplicationStatus, downloadDocument } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

// Rate limit: Max 10 login attempts per 15 minutes per IP
router.post('/login', rateLimiter(10), loginAdmin);
router.get('/applications', protect, authorizeRoles('admin'), getApplications);
router.put('/applications/:id/status', protect, authorizeRoles('admin'), updateApplicationStatus);
router.get('/applications/:id/documents/:docIndex', protect, authorizeRoles('admin'), downloadDocument);

module.exports = router;
