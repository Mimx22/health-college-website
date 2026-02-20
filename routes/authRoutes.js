const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword, loginUser } = require('../controllers/authController');

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/login', loginUser);

module.exports = router;
