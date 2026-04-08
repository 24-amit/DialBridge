// user.service.js
const User = require('./user.model');

exports.findOrCreateUser = async ({ uid, mobile, name }) => {
    let user = await User.findOne({ uid });

    if (!user) {
        user = await User.create({
            uid,
            mobile,
            name: name || ''
        });
    }

    return user;
};

exports.updateOnlineStatus = async (uid, status) => {
    return await User.findOneAndUpdate(
        { uid },
        {
            isOnline: status,
            lastSeen: status ? null : new Date()
        },
        { new: true }
    );
};

exports.getUserById = async (uid) => {
    return await User.findOne({ uid });
};