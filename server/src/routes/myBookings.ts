import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";

const router = express.Router();

router.get("/", verifyToken, async (request: Request, response: Response) => {
  try {
    const hotels = await Hotel.find({
      bookings: { $elemMatch: { userId: request.userId } },
    });

    const results = hotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === request.userId
      );

      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(),
        bookings: userBookings,
      };

      return hotelWithUserBookings;
    });

    response.status(200).send(results);
  } catch (error) {
    console.log("Error", error);
    response.status(500).json({ message: "Unable to fetch bookings" });
  }
});

export default router;
