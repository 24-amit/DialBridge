// auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyFirebaseToken } = require('../../middleware/auth.middleware');

router.post('/login', verifyFirebaseToken, authController.firebaseLogin);
router.get('/firebase-login', (req, res) => {
    res.send("Auth route working");
});

module.exports = router;