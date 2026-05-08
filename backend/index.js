const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  transports: ["websocket", "polling"],
});

/* ---------- STATIC FRONTEND ---------- */
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* ---------- SOCKET ---------- */
io.on("connection", (socket) => {
  console.log("✅ CONNECTED:", socket.id);

  /* USER REGISTER */
  socket.on("register", (userId) => {
    if (!userId) return;

    socket.userId = userId;

    socket.join(userId);

    console.log("👤 REGISTERED:", userId);
  });

  /* ---------- CALL ---------- */
  socket.on("call-user", ({ to, from }) => {
    console.log("📞 CALL:", from, "->", to);

    io.to(to).emit("incoming-call", {
      from,
    });
  });

  socket.on("call-accepted", ({ to, from }) => {
    io.to(to).emit("call-accepted", {
      from,
    });
  });

  socket.on("call-rejected", ({ to, from }) => {
    io.to(to).emit("call-rejected", {
      from,
    });
  });

  socket.on("end-call", ({ to, from }) => {
    io.to(to).emit("call-ended", {
      from,
    });
  });

  /* ---------- WEBRTC ---------- */
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", offer);
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", candidate);
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    console.log("❌ DISCONNECTED:", socket.id);
  });
});

/* ---------- SERVER ---------- */
server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
