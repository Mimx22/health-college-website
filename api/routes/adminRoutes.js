const express = require('express');
const router = express.Router();
const { getApplications, updateApplicationStatus } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/applications', protect, authorizeRoles('admin'), getApplications);
router.put('/applications/:id/status', protect, authorizeRoles('admin'), updateApplicationStatus);

module.exports = router;
