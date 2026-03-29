// user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

router.post('/register', userController.registerUser);
router.get('/:mobile', userController.getUser);
router.put('/status', userController.updateStatus);

module.exports = router;