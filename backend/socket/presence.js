const onlineUsers = new Map(); 
// userId -> Set of socketIds

const handleConnection = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // USER AUTHENTICATION VIA SOCKET
        socket.on("register", (userId) => {
            socket.userId = userId;

            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }

            onlineUsers.get(userId).add(socket.id);

            console.log(`User ${userId} is online`);

            io.emit("user-online", userId);
        });

        socket.on("disconnect", () => {
            const userId = socket.userId;

            if (!userId) return;

            const userSockets = onlineUsers.get(userId);

            if (userSockets) {
                userSockets.delete(socket.id);

                // If no active sockets → offline
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} is offline`);
                    io.emit("user-offline", userId);
                }
            }
        });
    });
};

const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};

module.exports = { handleConnection, isUserOnline };