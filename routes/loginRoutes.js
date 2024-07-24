const express = require('express');
const { login, verifyOtp } = require('../controllers/loginController');
const router = express.Router();

// Define routes
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

module.exports = router;