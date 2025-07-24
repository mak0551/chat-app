import express from "express";
import { getHistory } from "../controllers/chat.js";

const router = express.Router();

router.get("/history/:roomId", getHistory);

export default router;
