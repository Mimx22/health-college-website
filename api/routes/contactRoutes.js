const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../controllers/contactController');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/', rateLimiter(5), submitContactForm);

module.exports = router;
