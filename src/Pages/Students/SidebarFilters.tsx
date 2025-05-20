import { useState } from "react";
import { Icon } from "@iconify/react";

// Define filter options with their possible values
const filterOptions = [
  { name: "Topics", values: ["Math", "Science", "History", "Literature"] },
  { name: "Language", values: ["English", "Spanish", "French", "German"] },
  {
    name: "Rating",
    values: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
  },
  { name: "Price", values: ["Free", "$1-$10", "$10-$50", "$50+"] },
  {
    name: "Video Duration",
    values: ["0-10 min", "10-30 min", "30-60 min", "60+ min"],
  },
];

const SidebarFilters = ({ courses }) => {
  // State to track which filter is expanded
  const [expandedFilter, setExpandedFilter] = useState(null);
  // State to track selected filter values
  const [selectedFilters, setSelectedFilters] = useState({});

  // Toggle filter expansion
  const toggleFilter = (filterName) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };

  // Handle filter value selection
  const handleFilterSelect = (filterName, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return (
    <div className="w-full md:w-64 p-4 border-r border-gray-200">
      <button className="flex md:hidden items-center mb-4 gap-2 text-indigo-600 font-semibold">
        <Icon icon="mdi:filter-outline" className="w-5 h-5" />
        Filter
      </button>

      <div className="space-y-6">
        {filterOptions.map((option, index) => (
          <div key={index}>
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
                {option.values.map((value, idx) => (
                  <div
                    key={idx}
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

export default SidebarFilters;
