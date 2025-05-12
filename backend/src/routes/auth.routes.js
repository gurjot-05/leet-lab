import express from "express";
import {
  check,
  login,
  logout,
  makeAdmin,
  register,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);

authRoutes.post("/login", login);

authRoutes.post("/make-admin", authMiddleware, makeAdmin);

authRoutes.post("/logout", authMiddleware, logout);

authRoutes.get("/check", authMiddleware, check);

export default authRoutes;
