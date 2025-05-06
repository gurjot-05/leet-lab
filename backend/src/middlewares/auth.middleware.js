import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.status(401).json({
        message: "Unauthorized user - No token provided",
      });
    }

    let decodedToken = "";

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Error in verifying jwt: ", error);
      res.status(401).json({
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
      res.status(404).json({
        message: "User not found",
      });
    }

    req.existingUser = existingUser;
    next();
  } catch (error) {
    console.error("Error authenticating user: ", error);
    res.status(500).json({
      message: "Error authenticating user",
    });
  }
};
