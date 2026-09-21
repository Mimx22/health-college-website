const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const rateLimiter = require('../middleware/rateLimiter');
const { registerStudent, loginStudent } = require('../controllers/studentController');

// Multer configured to accept up to 6 files, using local storage
// Rate limit: Max 5 applications per 15 minutes per IP
router.post('/register', rateLimiter(5), upload.array('documents', 6), registerStudent);
router.post('/login', rateLimiter(10), loginStudent);

module.exports = router;
