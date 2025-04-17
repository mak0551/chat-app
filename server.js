import express from "express";
import socketIo from "socket.io";

const app = express();
const io = socketIo(server);

app.use(express.static("public")); // serve static files from public folder

io.on("connection", (socket) => {
  // io.on('connection'): Listens for a new client connecting via WebSocket. socket: Represents that individual user's connection Each connected user has their own socket
  console.log("A user connected");

  socket.on("chat message", (msg) => {
    //socket.on('chat message'): Waits for a 'chat message' event from a user.  msg: The message text sent from the client io.emit(...): Sends that message to everyone, including the sender.
    io.emit("chat message", msg); // broadcast to all clients
  });

  socket.on("disconnect", () => {
    // disconnect fires when a user closes their browser/tab or loses connection.
    console.log("User disconnected");
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
