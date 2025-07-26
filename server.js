import express from "express";
import http from "http";
import { Server } from "socket.io"; // taking server from socket.io, This class lets you create a WebSocket server on top of your HTTP server.
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { message } from "./models/Message.js";
dotenv.config();

import authRoutes from "./routes/auth.js";
import ChatRoutes from "./routes/chat.js";
import { socketAuth } from "./middleware/socketAuth.js";
import { ChatRoom } from "./models/ChatRoom.js";

const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to database");
  } catch (err) {
    console.error(
      "Error connecting to the database, retrying in 5 seconds...",
      err
    );
    setTimeout(connectWithRetry, 5000);
  }
};
connectWithRetry();

const app = express();
app.use(express.json());

const server = http.createServer(app); // creating a http server here, Required to manually create an HTTP server, which is needed for attaching Socket.IO.
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true }, // CORS configuration for Socket.IO
});

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const port = process.env.PORT || 5000;
// server.listen() is used instead of app.listen() because we are using Socket.IO, which requires an HTTP server instance.
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/chat", ChatRoutes);

io.use(socketAuth); // in sockets middleware we write io.use not app.use, because we are using socket.io not express.js

// This is the main event listener that runs whenever a client (browser/app) connects to your server via WebSocket.
// socket is a unique object for each connected client. socket.id is the unique ID assigned to this specific connection.
io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  // The client must send { recipientId } — the ID of the user they want to chat with.
  // socket.user.id is the current user’s ID (set via middleware).
  socket.on("join room", async ({ recipientId }) => {
    const users = [socket.user.id, recipientId].sort(); // ensures consistent room naming (e.g., ["u1", "u2"] is the same as ["u2", "u1"]).

    // Searches if a chat room already exists where both users are participants. $all means both must be present. $size: 2 ensures only those two are in the room.
    let room = await ChatRoom.findOne({
      participants: { $all: users, $size: 2 },
    });

    // If no room exists, create a new one.
    if (!room) {
      room = await ChatRoom.create({ participants: users });
    }

    // Then the user joins that room:
    socket.join(room._id.toString());
    // Sends room info back to client
    socket.emit("room joined", room._id);
  });

  socket.on("send message", async ({ roomId, content }) => {
    const msg = await message.create({
      roomId,
      sender: socket.user.id,
      content,
    });

    io.to(roomId).emit("receive message", {
      sender: socket.user.username,
      content,
      createdAt: msg.createdAt,
    });
  });
});

// import express from "express";
// import http from "http";
// import { Server } from "socket.io"; // taking server from socket.io, This class lets you create a WebSocket server on top of your HTTP server.

// const app = express();
// const server = http.createServer(app); // creating a http server here, Required to manually create an HTTP server, which is needed for attaching Socket.IO.

// const io = new Server(server); // 'io' is your Socket.IO server instance. It listens for real-time WebSocket connections from the frontend.

// app.use(express.static("public")); // serve static files from public folder

// let userCount = 0;
// const userMap = new Map(); // Map() is a built-in JS function

// io.on("connection", (socket) => {
//   // io.on('connection'): Fired whenever a client connects (via browser).. socket: Represents that individual user's connection Each connected user has their own socket
//   console.log("A user connected");

//   userCount++;
//   const userName = `user${userCount}`;

//   userMap.set(socket.id, userName); // Store the user's name in a map with the socket ID as the key, the socket.id is a unique identifier for each connected user.

//   socket.broadcast.emit("user connected", `${userName} has joined the chat`); // socket.broadcast.emit(...): Sends a message to all clients except the sender

//   socket.emit("your name", userName); // This sends the username **only to the connected client**

//   socket.on("chat message", (msg) => {
//     //socket.on('chat message'): Waits for a 'chat message' event from a user.  msg: The message text sent from the client io.emit(...): Sends that message to everyone, including the sender.

//     const name = userMap.get(socket.id); // whatever the userName is stored in the map, we get it using the socket.id

//     io.emit("chat message", `${name} : ${msg}`); // broadcast to all clients
//   });

//   socket.on("disconnect", () => {
//     // disconnect fires when a user closes their browser/tab or loses connection.
//     console.log("User disconnected");

//     const name = userMap.get(socket.id); // whatever the userName is stored in the map, we get it using the socket.id

//     socket.broadcast.emit("user disconnected", `${name} has left the chat`);

//     userMap.delete(socket.id); // Remove the user from the map
//   });
// });

// server.listen(3000, () => {
//   console.log("Server is running on http://localhost:3000");
// });
