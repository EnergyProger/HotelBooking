import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import User from "../models/user";

const router = express.Router();

router.get("/me", verifyToken, async (request: Request, response: Response) => {
  const userId = request.userId;

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return response.status(400).json({ message: "User not found" });
    }

    response.json(user);
  } catch (error) {
    console.log("Error", error);
    response.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
