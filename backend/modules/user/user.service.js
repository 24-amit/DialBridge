// user.service.js
const User = require('./user.model');

exports.createUser = async (data) => {
    const existingUser = await User.findOne({ mobile: data.mobile });

    if (existingUser) {
        throw new Error('User already exists');
    }

    const user = new User(data);
    return await user.save();
};

exports.getUserByMobile = async (mobile) => {
    return await User.findOne({ mobile });
};

exports.setUserOnlineStatus = async (mobile, status) => {
    return await User.findOneAndUpdate(
        { mobile },
        { isOnline: status },
        { new: true }
    );
};