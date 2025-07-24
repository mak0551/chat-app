import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// This is a Socket.IO middleware — it receives a socket and a next function (not req/res like Express).
export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Auth token missing"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return next(new Error("User not found"));
    socket.user = { id: user._id, username: user.username };

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
};
