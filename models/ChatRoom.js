import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
