import { hotelStarRating } from "../config/hotel-options-config";

interface Props {
  selectedStars: string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StarRatingFilter: React.FC<Props> = ({ selectedStars, onChange }) => {
  return (
    <div className="border-b border-slate-300 pb-5">
      <h4 className="text-md font-semibold mb-2">Property Rating</h4>
      {hotelStarRating.map((star) => (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded"
            value={star}
            checked={selectedStars.includes(star.toString())}
            onChange={onChange}
          />
          <span>{star} Stars</span>
        </label>
      ))}
    </div>
  );
};

export default StarRatingFilter;
