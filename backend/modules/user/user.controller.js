// user.controller.js
const userService = require('./user.service');

exports.registerUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await userService.getUserByMobile(req.params.mobile);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const user = await userService.setUserOnlineStatus(
            req.body.mobile,
            req.body.isOnline
        );
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};