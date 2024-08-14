import * as apiClient from "../api-client";
import { useQuery } from "react-query";
import HotelBookingCard from "../components/HotelBookingCard";

const MyBookings = () => {
  const { data: hotels } = useQuery(
    "fetchMyBookings",
    apiClient.fetchMyBookings
  );

  if (!hotels || hotels.length === 0) {
    return <span>No bookings found</span>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      {hotels.map((hotel) => (
        <HotelBookingCard hotel={hotel} key={hotel._id} />
      ))}
    </div>
  );
};

export default MyBookings;
