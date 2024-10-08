import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import myHotelsRoutes from "./routes/myHotels";
import hotelRoutes from "./routes/hotels";
import userRoutes from "./routes/users";
import myBookingsRoutes from "./routes/myBookings";

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
app.use("/api/hotels", hotelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-bookings", myBookingsRoutes);

app.get("*", (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`The server runs on port ${process.env.SERVER_PORT}`);
});
