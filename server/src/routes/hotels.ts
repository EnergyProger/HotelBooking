import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE } from "../common/constants";
import { HotelSearchResponse } from "../shared/types";

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
