const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, updateProfile, getMe } = require('../controllers/studentController');
const { studentAuth } = require('../middleware/studentAuth');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/me', studentAuth, getMe);
router.put('/profile', updateProfile);

module.exports = router;
