// auth.controller.js
const userService = require('../user/user.service');

exports.firebaseLogin = async (req, res) => {
    try {
        const { uid, mobile } = req.user;
        const { name } = req.body;

        const user = await userService.findOrCreateUser({
            uid,
            mobile,
            name
        });

        res.json({
            message: 'Login successful',
            user
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};