const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const admin = require("firebase-admin");

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
  transports: ["websocket", "polling"],
});

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

io.on("connection", async (socket) => {
  console.log("✅ CONNECTED:", socket.id);

  function normalize(num) {
    const digits = (num || "").toString().replace(/\D/g, "");
    return "+91" + digits.slice(-10);
  }

  let { userId, sessionId } = socket.handshake.query;
  if (!userId) {
    socket.disconnect(true);
    return;
  }

  userId = normalize(userId);

  if (!userId || !sessionId) {
    socket.disconnect(true);
    return;
  }

  socket.userId = userId;
  socket.sessionId = sessionId;

  socket.join(userId);

  setTimeout(() => {
    const room = io.sockets.adapter.rooms.get(userId);
  }, 1000);

  const userRef = db.ref("status/" + userId);

  const snap = await userRef.once("value");
  const data = snap.val();

  if (data?.socketId && data.socketId !== socket.id) {
    io.to(data.socketId).emit("force-logout");
    io.sockets.sockets.get(data.socketId)?.disconnect(true);
  }

  await userRef.update({
    sessionId,
    socketId: socket.id,
    online: true,
    lastSeen: Date.now(),
  });

  /* validate before every action */
  async function valid() {
    const s = await userRef.once("value");
    const d = s.val();

    return d?.sessionId === socket.sessionId && d?.socketId === socket.id;
  }

  socket.onAny((event, ...args) => {
    console.log("📩 SERVER RECEIVED:", event, args);
  });

  /* ---------- CALL EVENTS ---------- */
  socket.on("call-user", async ({ to, from }) => {
    // const from = socket.userId;

    to = normalize(to);

    console.log("📞 CALL REQUEST");
    console.log("FROM:", from);
    console.log("TO:", to);

    if (!(await valid())) return socket.emit("force-logout");

    const snap = await db.ref("status/" + to).once("value");
    const data = snap.val();
    const targetSocket = io.sockets.sockets.get(data?.socketId);

    if (!data?.online || !targetSocket) {
      return socket.emit("user-offline");
    }
    io.to(to).emit("incoming-call", { from });
  });

  socket.on("call-accepted", async ({ to }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }
    io.to(to).emit("call-accepted", { from: socket.userId });
  });

  socket.on("offer", async ({ to, offer }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }
    io.to(to).emit("offer", offer);
  });

  socket.on("answer", async ({ to, answer }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }
    io.to(to).emit("answer", answer);
  });

  socket.on("call-rejected", async ({ to }) => {
    if (!(await valid())) return;
    io.to(to).emit("call-rejected");
  });

  socket.on("ice-candidate", async ({ to, candidate }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }
    io.to(to).emit("ice-candidate", candidate);
  });

  socket.on("end-call", async ({ to }) => {
    if (!(await valid())) {
      socket.emit("force-logout");
      socket.disconnect(true);
      return;
    }
    io.to(to).emit("call-ended");
  });

  socket.on("disconnect", async () => {
    console.log("❌ DISCONNECTED:", socket.id);

    setTimeout(async () => {
      try {
        const snap = await userRef.once("value");
        const data = snap.val();

        // only mark offline if THIS socket is still active owner
        if (
          data?.sessionId === socket.sessionId &&
          data?.socketId === socket.id
        ) {
          await userRef.update({
            online: false,
            socketId: null,
            lastSeen: Date.now(),
          });

          console.log("🔴 USER OFFLINE:", userId);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
