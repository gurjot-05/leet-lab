import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized user - No token provided",
      });
    }

    let decodedToken = "";

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Error in verifying jwt: ", error);
      return res.status(401).json({
        message: "Unauthorized user - Invalid token",
      });
    }

    const existingUser = await db.user.findUnique({
      where: { id: decodedToken.id },
      select: {
        id: true,
        image: true,
        role: true,
        name: true,
        email: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.existingUser = existingUser;
    next();
  } catch (error) {
    console.error("Error authenticating user: ", error);
    return res.status(500).json({
      message: "Error authenticating user",
    });
  }
};

export const checkAdmin = async (req, res, next) => {
  try {
    const role = req.existingUser.role;
    if (role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (error) {
    console.error("Error checking admin role:", error);
    return res.status(500).json({ message: "Error checking admin role" });
  }
};
