import socket from "./socket.js";

const onlineUsers = new Set();

socket.on("user-online", (userId) => {
    onlineUsers.add(userId);
    updateUI(userId, true);
});

socket.on("user-offline", (userId) => {
    onlineUsers.delete(userId);
    updateUI(userId, false);
});

function updateUI(userId, isOnline) {
    const el = document.getElementById(`user-${userId}`);

    if (!el) return;

    el.innerText = isOnline ? "Online" : "Offline";
}