import { Icon } from "@iconify/react";

const filterOptions = [
  "Topics",
  "Language",
  "Rating",
  "Price",
  "Vedio Duration", 
];

const SidebarFilters = () => {
  return (
    <div className="w-full md:w-64 p-4 border-r border-gray-200">
      <button className="flex md:hidden items-center mb-4 gap-2 text-indigo-600 font-semibold">
        <Icon icon="mdi:filter-outline" className="w-5 h-5" />
        Filter
      </button>

      <div className="space-y-6">
        {filterOptions.map((option, index) => (
          <div key={index}>
            <div className="flex justify-between items-center text-gray-700 font-medium border-b pb-2">
              <span>{option}</span>
              <Icon icon="mdi:chevron-down" className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarFilters;
