import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import { FILE_SIZE_LIMIT, NUMBER_FILES_LIMIT } from "../common/constants";
import Hotel, { HotelType } from "../models/hotel";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
});

router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel type is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", NUMBER_FILES_LIMIT),
  async (request: Request, response: Response) => {
    try {
      const imageFiles = request.files as Express.Multer.File[];
      const newHotel: HotelType = request.body;

      const uploadPromises = imageFiles.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64");
        const dataURI = "data:" + image.mimetype + ";base64," + b64;
        const result = await cloudinary.v2.uploader.upload(dataURI);
        return result.url;
      });

      const imageUrls = await Promise.all(uploadPromises);

      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = request.userId;

      const hotel = new Hotel(newHotel);
      await hotel.save();

      return response.status(201).send(hotel);
    } catch (error) {
      console.log("Error creating hotel: ", error);
      response.status(500).json({ message: "Something went wrong" });
    }
  }
);

export default router;
