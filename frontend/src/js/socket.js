const socket = io("http://localhost:5000", {
    transports: ["websocket"], // avoid polling fallback
});

// Debug (don't remove initially)
socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

export default socket;