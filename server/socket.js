const socketIO = require("socket.io");

let io;

function initSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New WebSocket connection:", socket.id);

    // Example event for stock updates
    socket.on("stockUpdate", (data) => {
      console.log("Stock update received:", data);
      io.emit("stockUpdate", data); // Broadcast stock updates to all clients
    });
  });

  return io;
}

function getSocket() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initSocket, getSocket };