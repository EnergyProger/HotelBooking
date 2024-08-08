import { PAGE_DEFAULT } from "../common/constants";

interface Props {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ page, pages, onPageChange }) => {
  const pageNumbers = [];
  for (let number = PAGE_DEFAULT; number <= pages; number++) {
    pageNumbers.push(number);
  }

  return (
    <div className="flex justify-center">
      <ul className="flex border border-slate-300">
        {pageNumbers.map((number) => (
          <li className={`px-2 py-1 ${page === number ? "bg-gray-200" : ""}`}>
            <button onClick={() => onPageChange(number)}>{number}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pagination;
