import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";

mongoose.connect(process.env.MONGODB_CONNECTION as string);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/auth", authRoutes);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`The server runs on port ${process.env.SERVER_PORT}`);
});
