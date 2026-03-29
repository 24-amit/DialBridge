// auth.service.js
const User = require('../user/user.model');

const otpStore = {}; // TEMP (use Redis in real apps)

exports.sendOTP = async (mobile) => {
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[mobile] = otp;

    console.log(`OTP for ${mobile}: ${otp}`); // simulate SMS

    return true;
};

exports.verifyOTP = async (mobile, otp, name) => {
    if (!otpStore[mobile]) {
        throw new Error('OTP expired or not sent');
    }

    if (otpStore[mobile] != otp) {
        throw new Error('Invalid OTP');
    }

    delete otpStore[mobile];

    let user = await User.findOne({ mobile });

    if (!user) {
        user = await User.create({ name, mobile });
    }

    // Fake token (replace with JWT)
    const token = `token-${mobile}`;

    return {
        message: 'Login successful',
        user,
        token
    };
};