import express from "express";
import { getAllUsers, login, register } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/getAllUsers", getAllUsers);

export default router;
