interface Props {
  sortOption: string;
  onChange: (value: string) => void;
}

const HotelOptionsSort: React.FC<Props> = ({ sortOption, onChange }) => {
  return (
    <select
      value={sortOption}
      onChange={(event) => onChange(event.target.value)}
      className="p-2 border rounded-md"
    >
      <option value="">Sort By</option>
      <option value="starRating">Star Rating</option>
      <option value="pricePerNightAsc">Price Per Night (low to high)</option>
      <option value="pricePerNightDesc">Price Per Night (high to low)</option>
    </select>
  );
};

export default HotelOptionsSort;
