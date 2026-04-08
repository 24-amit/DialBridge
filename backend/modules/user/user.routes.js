// user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyFirebaseToken } = require('../../middleware/auth.middleware');

router.get('/me', verifyFirebaseToken, userController.getProfile);
router.put('/online', verifyFirebaseToken, userController.setOnline);
router.put('/offline', verifyFirebaseToken, userController.setOffline);

module.exports = router;