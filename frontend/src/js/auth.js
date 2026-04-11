const userId = result.user.uid; // or your backend userId

// store it
localStorage.setItem("userId", userId);

// connect to socket
socket.emit("register", userId);