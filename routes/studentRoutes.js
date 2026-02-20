const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerStudent, loginStudent, updateProfile, approveStudent, getAllStudents, getMe } = require('../controllers/studentController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const { studentAuth } = require('../middleware/studentAuth');

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.post('/register', upload.array('documents', 5), registerStudent);
router.post('/login', loginStudent);
router.get('/me', studentAuth, getMe);
router.get('/', authMiddleware, authorizeRoles('admin'), getAllStudents);
router.put('/profile', updateProfile);
router.patch('/:id/approve', authMiddleware, authorizeRoles('admin'), approveStudent);

module.exports = router;
