const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { registerStudent, loginStudent } = require('../controllers/studentController');

// Multer configured to accept up to 6 files under the field 'documents'
router.post('/register', upload.array('documents', 6), registerStudent);
router.post('/login', loginStudent);

module.exports = router;
