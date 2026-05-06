const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const admin = require("firebase-admin");
const users = new Map();

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
  const { userId, sessionId } = socket.handshake.query;

  if (!userId || !sessionId) {
    socket.disconnect(true);
    return;
  }

  socket.userId = userId;
  socket.sessionId = sessionId;

  users.set(userId, socket.id);

  const userRef = db.ref("status/" + userId);

  // THEN fetch updated state
  const snap = await userRef.once("value");
  const data = snap.val();

  if (data?.socketId && data.socketId !== socket.id) {
    io.to(data.socketId).emit("force-logout");
    io.sockets.sockets.get(data.socketId)?.disconnect(true);
  }

  await userRef.set({
    sessionId,
    socketId: socket.id,
    online: true,
    lastSeen: Date.now(),
  });

  console.log("User connected:", userId);

  /* OPTIONAL SAFETY: validate before every action */
  async function valid() {
    const s = await userRef.once("value");
    const d = s.val();
    return d?.sessionId === socket.sessionId;
  }

  /* ---------- CALL EVENTS ---------- */
  socket.on("call-user", async ({ to, from }) => {
    if (!(await valid())) return socket.emit("force-logout");

    const socketId = users.get(to);

    // ❌ user not online
    if (!socketId) return socket.emit("user-offline");

    // ✅ send call
    io.to(socketId).emit("incoming-call", { from });
  });

  socket.on("call-accepted", async ({ to }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }

    const socketId = users.get(to);

    if (socketId) {
      io.to(socketId).emit("call-accepted");
    }
  });

  socket.on("offer", async ({ to, offer }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }

    const socketId = users.get(to);

    if (socketId) {
      io.to(socketId).emit("offer", offer);
    }
  });

  socket.on("answer", async ({ to, answer }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }

    const socketId = users.get(to);

    if (socketId) {
      io.to(socketId).emit("answer", answer);
    }
  });

  socket.on("call-rejected", async ({ to }) => {
    const snap = await db.ref("status/" + to).once("value");
    const data = snap.val();

    if (data?.socketId) {
      io.to(data.socketId).emit("call-rejected");
    }
  });

  socket.on("ice-candidate", async ({ to, candidate }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }

    const socketId = users.get(to);

    if (socketId) {
      io.to(socketId).emit("ice-candidate", candidate);
    }
  });

  socket.on("end-call", async ({ to, from }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }

    const socketId = users.get(to);

    if (socketId) {
      io.to(socketId).emit("call-ended");
    }
  });

  socket.on("disconnect", async () => {
    users.delete(socket.userId);

    const snap = await userRef.once("value");
    const data = snap.val();

    if (
      data?.socketId === socket.id &&
      data?.sessionId === socket.sessionId &&
      data?.online === true
    ) {
      await userRef.update({
        online: false,
        socketId: null,
        lastSeen: Date.now(),
      });
    }

    console.log("Disconnected:", socket.userId);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
