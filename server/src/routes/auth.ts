import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { PASSWORD_LENGTH } from "../common/constants";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/register",
  [
    check("firstName", "First name is required").isString(),
    check("lastName", "Last name is required").isString(),
    check("email", "Email is required").isEmail(),
    check(
      "password",
      `Password with ${PASSWORD_LENGTH} or more characters required`
    ).isLength({
      min: PASSWORD_LENGTH,
    }),
  ],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ message: errors.array() });
    }
    try {
      let user = await User.findOne({
        email: request.body.email,
      });

      if (user) {
        return response.status(400).json({ message: "User already exists" });
      }

      user = new User(request.body);
      await user.save();

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      response.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });

      return response.sendStatus(200);
    } catch (error) {
      console.log(error);
      response.status(500).send({ message: "Something went wrong" });
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check(
      "password",
      `Password with ${PASSWORD_LENGTH} or more characters required`
    ).isLength({
      min: PASSWORD_LENGTH,
    }),
  ],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ message: errors.array() });
    }

    const { email, password } = request.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return response.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return response.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      response.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });

      response.status(200).json({ userId: user._id });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: "Something went wrong" });
    }
  }
);

export default router;
