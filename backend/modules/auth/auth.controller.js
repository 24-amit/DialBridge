// auth.controller.js
const authService = require('./auth.service');

exports.sendOTP = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({ message: 'Mobile number required' });
        }

        await authService.sendOTP(mobile);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { mobile, otp, name } = req.body;

        const result = await authService.verifyOTP(mobile, otp, name);

        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};