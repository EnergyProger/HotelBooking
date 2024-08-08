import * as apiClient from "../api-client";
import { useQuery } from "react-query";
import { useSearchContext } from "../contexts/SearchContext";
import { useState } from "react";
import SearchResultCard from "../components/SearchResultCard";
import Pagination from "../components/Pagination";
import StarRatingFilter from "../filters/StarRatingFilter";
import HotelTypesFilter from "../filters/HotelTypesFilter";
import FacilitiesFilter from "../filters/FacilitiesFilter";
import PriceFilter from "../filters/PriceFilter";
import {
  maxPricePerNightFilter,
  minPricePerNight,
} from "../config/hotel-options-config";
import HotelOptionsSort from "../components/HotelOptionsSort";
import { PAGE_DEFAULT } from "../common/constants";

const Search = () => {
  const search = useSearchContext();

  const [page, setPage] = useState<number>(PAGE_DEFAULT);
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedMinPrice, setSelectedMinPrice] =
    useState<number>(minPricePerNight);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number>(
    maxPricePerNightFilter
  );
  const [sortOption, setSortOption] = useState<string>("");

  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    facilities: selectedFacilities,
    minPrice: selectedMinPrice.toString(),
    maxPrice:
      selectedMaxPrice === maxPricePerNightFilter
        ? ""
        : selectedMaxPrice.toString(),
    sortOption,
  };

  const { data: hotelData } = useQuery(["searchHotels", searchParams], () =>
    apiClient.searchHotels(searchParams)
  );

  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const starRating = event.target.value;
    setSelectedStars((prevStars) =>
      event.target.checked
        ? [...prevStars, starRating]
        : prevStars.filter((star) => star !== starRating)
    );
  };

  const handleHotelTypesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hotelType = event.target.value;
    setSelectedHotelTypes((prevHotelTypes) =>
      event.target.checked
        ? [...prevHotelTypes, hotelType]
        : prevHotelTypes.filter((type) => type !== hotelType)
    );
  };

  const handleFacilitiesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hotelFacility = event.target.value;
    setSelectedFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, hotelFacility]
        : prevFacilities.filter((facility) => facility !== hotelFacility)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
            Filter by:
          </h3>
          <StarRatingFilter
            selectedStars={selectedStars}
            onChange={handleStarsChange}
          />
          <HotelTypesFilter
            selectedHotelTypes={selectedHotelTypes}
            onChange={handleHotelTypesChange}
          />
          <FacilitiesFilter
            selectedFacilities={selectedFacilities}
            onChange={handleFacilitiesChange}
          />
          <PriceFilter
            selectedMinPrice={selectedMinPrice}
            selectedMaxPrice={selectedMaxPrice}
            onChangeMinPrice={setSelectedMinPrice}
            onChangeMaxPrice={setSelectedMaxPrice}
          />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            {hotelData?.pagination.total} Hotels found
            {search.destination ? ` in ${search.destination}` : ""}
          </span>
          <HotelOptionsSort sortOption={sortOption} onChange={setSortOption} />
        </div>
        {hotelData?.data.map((hotel) => (
          <SearchResultCard hotel={hotel} />
        ))}
        {hotelData?.data.length !== 0 && (
          <div>
            <Pagination
              page={hotelData?.pagination.page || PAGE_DEFAULT}
              pages={hotelData?.pagination.pages || PAGE_DEFAULT}
              onPageChange={(page) => setPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
