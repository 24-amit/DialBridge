const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
const twilio = require('twilio');
const PORT = process.env.PORT || 5000;

const client = twilio("AC68c0133bddfe9e4e00e9e7f64ecd558d", "ea6c80704070c589a3a6c451181fe660");

const app = express();
// enable CORS
app.use(cors({
    origin: ["https://127.0.0.1:5500.vercel.app"],
    credentials: true
}));

// middleware
app.use(express.json());

const server = http.createServer(app);

const userRoutes = require('./modules/user/user.routes');
const authRoutes = require('./modules/auth/auth.routes');

// routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/turn-credentials', async (req, res) => {
    res.json([
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]);
});

// attach socket.io
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500"
    }
});

// start server
server.listen(PORT, () => {
    console.log('Server running on port 5000');
});

// socket connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
    socket.on("register", (phone) => {
        onlineUsers.set(phone, socket.id);
    });

    socket.on("call-user", ({ to, from }) => {
        console.log("CALL REQUEST:", from, "→", to);

        const receiverSocket = onlineUsers.get(to);

        if (!receiverSocket) {
            console.log("USER OFFLINE:", to);
            socket.emit("user-offline");
        } else {
            console.log("USER ONLINE:", to);
            socket.emit("call-ringing");
            io.to(receiverSocket).emit("incoming-call", { from });
        }
    });

    socket.on("call-accepted", ({ to }) => {
        const callerSocket = onlineUsers.get(to);
        io.to(callerSocket).emit("call-accepted");
    });

    socket.on("offer", ({ to, offer }) => {
        const receiverSocket = onlineUsers.get(to);
        io.to(receiverSocket).emit("offer", offer);
    });

    socket.on("answer", ({ to, answer }) => {
        const callerSocket = onlineUsers.get(to);
        io.to(callerSocket).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        const receiverSocket = onlineUsers.get(to);
        io.to(receiverSocket).emit("ice-candidate", candidate);
    });

    socket.on("end-call", ({ to, from }) => {
        const receiverSocket = onlineUsers.get(to);
        const callerSocket = onlineUsers.get(from);

        if (receiverSocket) {
            io.to(receiverSocket).emit("call-ended");
        }

        if (callerSocket) {
            io.to(callerSocket).emit("call-ended");
        }
    });

});