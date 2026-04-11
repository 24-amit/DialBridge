// auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyFirebaseToken } = require('../../middleware/auth.middleware');

// router.post('/login', verifyFirebaseToken, authController.firebaseLogin);
router.post('/login', verifyFirebaseToken, (req, res) => {
    res.json({
        message: "User authenticated",
        user: req.user
    });
});

router.get('/firebase-login', (req, res) => {
    res.send("Auth route working");
});

module.exports = router;