const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (phone) => {
        onlineUsers.set(phone, socket.id);
    });

    socket.on("call-user", ({ to, from }) => {
        const receiver = onlineUsers.get(to);

        if (!receiver) {
            socket.emit("user-offline");
        } else {
            socket.emit("call-ringing");
            io.to(receiver).emit("incoming-call", { from });
        }
    });

    socket.on("call-accepted", ({ to }) => {
        const caller = onlineUsers.get(to);
        io.to(caller).emit("call-accepted");
    });

    socket.on("offer", ({ to, offer }) => {
        const receiver = onlineUsers.get(to);
        io.to(receiver).emit("offer", offer);
    });

    socket.on("answer", ({ to, answer }) => {
        const caller = onlineUsers.get(to);
        io.to(caller).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        const receiver = onlineUsers.get(to);
        io.to(receiver).emit("ice-candidate", candidate);
    });

    socket.on("end-call", ({ to, from }) => {
        const receiver = onlineUsers.get(to);
        const caller = onlineUsers.get(from);

        if (receiver) io.to(receiver).emit("call-ended");
        if (caller) io.to(caller).emit("call-ended");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});