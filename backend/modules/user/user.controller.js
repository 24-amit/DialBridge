// user.controller.js
const userService = require('./user.service');

exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.uid);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.setOnline = async (req, res) => {
    try {
        const user = await userService.updateOnlineStatus(req.user.uid, true);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.setOffline = async (req, res) => {
    try {
        const user = await userService.updateOnlineStatus(req.user.uid, false);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};