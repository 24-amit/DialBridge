const express = require('express');
const app = express();

const userRoutes = require('./modules/user/user.routes');
const authRoutes = require('./modules/auth/auth.routes');

// middleware
app.use(express.json());

// routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// server start
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});