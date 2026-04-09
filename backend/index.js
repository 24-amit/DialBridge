const express = require('express');
const cors = require('cors');

const app = express();

const userRoutes = require('./modules/user/user.routes');
const authRoutes = require('./modules/auth/auth.routes');

// enable CORS
app.use(cors());

// middleware
app.use(express.json());

// routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

// server start
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});