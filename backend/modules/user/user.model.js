// user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);