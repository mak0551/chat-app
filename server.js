import express from "express";
import http from "http";
import { Server } from "socket.io"; // taking server from socket.io, This class lets you create a WebSocket server on top of your HTTP server.

const app = express();
const server = http.createServer(app); // creating a http server here, Required to manually create an HTTP server, which is needed for attaching Socket.IO.

const io = new Server(server); // io is your Socket.IO server instance. It listens for real-time WebSocket connections from the frontend.

app.use(express.static("public")); // serve static files from public folder

io.on("connection", (socket) => {
  // io.on('connection'): Fired whenever a client connects (via browser).. socket: Represents that individual user's connection Each connected user has their own socket
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

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
