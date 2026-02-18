const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, updateProfile, approveStudent } = require('../controllers/studentController');
const { adminAuth } = require('../middleware/authMiddleware');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.put('/profile', updateProfile);
router.patch('/:id/approve', adminAuth, approveStudent);

module.exports = router;
