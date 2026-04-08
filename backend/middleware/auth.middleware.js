// middleware/auth.middleware.js
const admin = require('../config/firebase');

exports.verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = await admin.auth().verifyIdToken(token);

        req.user = {
            uid: decoded.uid,
            mobile: decoded.phone_number
        };

        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};