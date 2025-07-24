import { message } from "../models/Message.js";

export const getHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await message
      .find({ roomId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });
    if (messages.length < 1) {
      return res.status(404).json({ error: "No messages found in this room." });
    }
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};
