const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
const { handleConnection } = require("./socket/presence");

const app = express();
// enable CORS
app.use(cors());

// middleware
app.use(express.json());

const server = http.createServer(app);

const userRoutes = require('./modules/user/user.routes');
const authRoutes = require('./modules/auth/auth.routes');

// routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// attach socket.io
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500"
    }
});

// socket connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// start server
server.listen(5000, () => {
    console.log('Server running on port 5000');
});