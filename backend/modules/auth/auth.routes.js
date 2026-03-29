// auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Step 1: Send OTP
router.post('/send-otp', authController.sendOTP);

// Step 2: Verify OTP
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;