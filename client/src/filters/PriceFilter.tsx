import MultiRangeSlider from "multi-range-slider-react";
import {
  maxPricePerNightFilter,
  minPricePerNight,
  stepPricePerNightFilter,
} from "../config/hotel-options-config";

interface Props {
  selectedMinPrice: number;
  selectedMaxPrice: number;
  onChangeMinPrice: (value: number) => void;
  onChangeMaxPrice: (value: number) => void;
}

const PriceFilter: React.FC<Props> = ({
  selectedMinPrice,
  selectedMaxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
}) => {
  const handlePriceChange = (event: any) => {
    onChangeMinPrice(event.minValue);
    onChangeMaxPrice(event.maxValue);
  };

  return (
    <div>
      <MultiRangeSlider
        min={minPricePerNight}
        max={maxPricePerNightFilter}
        step={stepPricePerNightFilter}
        minValue={selectedMinPrice}
        maxValue={selectedMaxPrice}
        onChange={(event) => {
          handlePriceChange(event);
        }}
        className="border-none shadow-none"
        ruler={false}
        barInnerColor="blue"
        label={false}
      />
      <div className="flex justify-between">
        <span>${selectedMinPrice}</span>
        <span>
          $
          {selectedMaxPrice === maxPricePerNightFilter
            ? `${maxPricePerNightFilter}+`
            : selectedMaxPrice}
        </span>
      </div>
    </div>
  );
};

export default PriceFilter;
