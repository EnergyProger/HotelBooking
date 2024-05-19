import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyToken = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const token = request.cookies["auth_token"];
  if (!token) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    request.userId = (decoded as JwtPayload).userId;
    next();
  } catch (error) {
    return response.status(401).json({ message: "Unauthorized" });
  }
};

export default verifyToken;
