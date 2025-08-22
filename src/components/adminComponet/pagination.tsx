import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "../ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

function Pagination({ currentPage, totalPages, setCurrentPage }: PaginationProps) {
    return (
      <div className="flex justify-center mt-6 space-x-2">
        <Button
          variant="ghost"
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-2 cursor-pointer"
        >
          <Icon icon="mdi:chevron-left" className="text-lg" />
        </Button>

        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index}
            size="sm"
            variant={currentPage === index + 1 ? "default" : "outline"}
            className={`rounded cursor-pointer ${
              currentPage === index + 1 ? "bg-indigo-600 text-white" : ""
            }`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </Button>
        ))}

        <Button
          variant="ghost"
          onClick={() =>
            setCurrentPage(Math.min(currentPage + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-2 cursor-pointer"
        >
          <Icon icon="mdi:chevron-right" className="text-lg" />
        </Button>
      </div>
    );
}

export default Pagination;
