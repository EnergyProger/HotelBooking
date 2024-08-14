import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE } from "../common/constants";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

const router = express.Router();

router.get("/search", async (request: Request, response: Response) => {
  try {
    const query = constructSearchQuery(request.query);

    let sortOptions = {};

    switch (request.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageNumber = parseInt(
      request.query.page
        ? request.query.page.toString()
        : PAGE_NUMBER_DEFAULT.toString()
    );
    const skip = (pageNumber - 1) * PAGE_SIZE;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(PAGE_SIZE);

    const total = await Hotel.countDocuments(query);

    const hotelSearchResponse: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / PAGE_SIZE),
      },
    };

    response.json(hotelSearchResponse);
  } catch (error) {
    console.log("Error", error);
    response.status(500).json({ message: "Something went wrong" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const id = request.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      response.json(hotel);
    } catch (error) {
      console.log("Error fetching hotel", error);
      response.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (request: Request, response: Response) => {
    try {
      const { numberOfNights } = request.body;
      const hotelId = request.params.hotelId;

      const hotel = await Hotel.findById(hotelId);

      if (!hotel) {
        return response.status(400).json({ message: "Hotel not found" });
      }

      const totalCost = hotel.pricePerNight * numberOfNights;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCost * 100,
        currency: "USD",
        metadata: {
          hotelId,
          userId: request.userId,
        },
      });

      if (!paymentIntent.client_secret) {
        return response
          .status(500)
          .json({ message: "Error creating payment intent" });
      }

      const responsePaymentIntent = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret.toString(),
        totalCost,
      };

      response.send(responsePaymentIntent);
    } catch (error) {
      console.log("Error", error);
      response.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (request: Request, response: Response) => {
    try {
      const paymentIntentId = request.body.paymentIntentId;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string
      );

      if (!paymentIntent) {
        return response
          .status(400)
          .json({ message: "Payment intent not found" });
      }

      if (
        paymentIntent.metadata.hotelId !== request.params.hotelId ||
        paymentIntent.metadata.userId !== request.userId
      ) {
        return response
          .status(400)
          .json({ message: "Payment intent mismatch" });
      }

      if (paymentIntent.status !== "succeeded") {
        return response.status(400).json({
          message: `Payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
      }

      const newBooking: BookingType = {
        ...request.body,
        userId: request.userId,
      };

      const hotel = await Hotel.findOneAndUpdate(
        { _id: request.params.hotelId },
        {
          $push: { bookings: newBooking },
        },
        { new: true }
      );

      if (!hotel) {
        return response.status(400).json({ message: "Hotel not found" });
      }

      response.status(200).send();
    } catch (error) {
      console.log("Error", error);
      response.status(500).json({ message: "Something went wrong" });
    }
  }
);

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.minPrice || queryParams.maxPrice) {
    constructedQuery.pricePerNight = {};
    if (queryParams.minPrice) {
      constructedQuery.pricePerNight.$gte = parseInt(
        queryParams.minPrice
      ).toString();
    }

    if (queryParams.maxPrice) {
      constructedQuery.pricePerNight.$lte = parseInt(
        queryParams.maxPrice
      ).toString();
    }
  }

  return constructedQuery;
};

export default router;
