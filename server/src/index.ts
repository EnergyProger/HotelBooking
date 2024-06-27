import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import myHotelsRoutes from "./routes/myHotels";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGODB_CONNECTION as string);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, "../../client/dist")));

app.use("/api/auth", authRoutes);
app.use("/api/my-hotels", myHotelsRoutes);

app.get("*", (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`The server runs on port ${process.env.SERVER_PORT}`);
});
