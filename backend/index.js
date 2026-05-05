const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const admin = require("firebase-admin");
const onlineUsers = new Map();

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-service-account.json")),
  databaseURL: "https://dialbridge-972c9-default-rtdb.firebaseio.com",
});

const db = admin.database();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

io.on("connection", async (socket) => {
  try {
    const { userId, sessionId } = socket.handshake.query;

    if (!userId || !sessionId) {
      socket.disconnect(true);
      return;
    }

    // 🔍 Validate session from Firebase
    const snap = await db.ref("status/" + userId).once("value");
    const data = snap.val();

    // 🚫 BLOCK IF SESSION INVALID
    if (!data || data.sessionId !== sessionId) {
      socket.disconnect(true);
      return;
    }

    // 🔥 Kick old session if exists
    const oldSocketId = onlineUsers.get(userId);
    if (oldSocketId && oldSocketId !== socket.id) {
      io.to(oldSocketId).emit("force-logout");
      io.sockets.sockets.get(oldSocketId)?.disconnect(true);
    }

    // ✅ STORE USER SECURELY
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;

    console.log("User connected:", userId);

    /* ---------- CALL EVENTS ---------- */
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
      if (caller) io.to(caller).emit("call-accepted");
    });

    socket.on("offer", ({ to, offer }) => {
      const receiver = onlineUsers.get(to);
      if (receiver) io.to(receiver).emit("offer", offer);
    });

    socket.on("answer", ({ to, answer }) => {
      const caller = onlineUsers.get(to);
      if (caller) io.to(caller).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      const receiver = onlineUsers.get(to);
      if (receiver) io.to(receiver).emit("ice-candidate", candidate);
    });

    socket.on("end-call", ({ to, from }) => {
      const receiver = onlineUsers.get(to);
      const caller = onlineUsers.get(from);

      if (receiver) io.to(receiver).emit("call-ended");
      if (caller) io.to(caller).emit("call-ended");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", userId);

      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
      }
    });
  } catch (err) {
    console.error("Socket error:", err);
    socket.disconnect(true);
  }
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});