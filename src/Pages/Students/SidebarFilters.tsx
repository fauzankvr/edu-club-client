import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";

interface FilterOption {
  name: string;
  values: string[];
}

interface SidebarFiltersProps {
  language: string[];
  category: string[];
  selectedFilters: { [key: string]: string  };
  onFilterChange: (filters: { [key: string]: string  }) => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  language,
  category,
  selectedFilters,
  onFilterChange,
}) => {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { name: "Topics", values: category },
      { name: "Language", values: language },
      {
        name: "Rating",
        values: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
      },
      { name: "Price", values: ["Free", "₹100-₹1000", "₹1000-₹5000", "₹5000+"] },
    ],
    [language, category]
  );
  

  const toggleFilter = (filterName: string) => {
    setExpandedFilter((prev) => (prev === filterName ? null : filterName));
  };

  const handleFilterSelect = (filterName: string, value: string) => {
    const newFilters = { ...selectedFilters };

    if (filterName === "Rating") {
      newFilters.Rating = value.split(" ")[0]; 
    } else if (filterName === "Price") {
      if (value === "Free") {
        newFilters.priceMin = "0";
        newFilters.priceMax = "0";
      } else if (value.includes("-")) {
        const [min, max] = value.replace(/₹/g, "").split("-");
        newFilters.priceMin = String(Number(min));
        newFilters.priceMax = String(Number(max));
      } else if (value.includes("+")) {
        const min = value.replace(/₹/g, "").replace("+", "");
        newFilters.priceMin = String(Number(min));
        newFilters.priceMax = ""; // No upper limit
      }
    } else {
      newFilters[filterName] = value;
    }

    onFilterChange(newFilters);
  };  
  

  return (
    <div className="w-full md:w-64 p-4 border-r border-gray-200">
      <button className="flex md:hidden items-center mb-4 gap-2 text-indigo-600 font-semibold">
        <Icon icon="mdi:filter-outline" className="w-5 h-5" />
        Filter
      </button>

      <div className="space-y-6">
        {filterOptions.map((option) => (
          <div key={option.name}>
            <div
              className="flex justify-between items-center text-gray-700 font-medium border-b pb-2 cursor-pointer"
              onClick={() => toggleFilter(option.name)}
            >
              <span>{option.name}</span>
              <Icon
                icon={
                  expandedFilter === option.name
                    ? "mdi:chevron-up"
                    : "mdi:chevron-down"
                }
                className="w-5 h-5 text-gray-500"
              />
            </div>
            {expandedFilter === option.name && (
              <div className="mt-2 space-y-2">
                {option.values.map((value) => (
                  <div
                    key={value}
                    className={`p-2 cursor-pointer rounded ${
                      selectedFilters[option.name] === value
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => handleFilterSelect(option.name, value)}
                  >
                    {value}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
