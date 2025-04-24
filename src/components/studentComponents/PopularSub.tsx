
import { Icon } from "@iconify/react";
import { useState } from "react";
import { Button } from "../ui/button";

const PopularSubjects = () => {
  const [expanded, setExpanded] = useState(false);

    return (
      <div className="bg-gray-50 py-12 px-6">
        <div className="container mx-auto text-center px-12 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
            {/* Left Section: Title & Heading */}
            <div className="text-left lg:w-1/2">
              <span className="text-indigo-600 font-semibold px-3 py-1 bg-indigo-100 rounded-md text-sm">
                TOP CATEGORIES
              </span>
              <h2 className="text-3xl font-bold mt-2">Popular Subjects</h2>
            </div>

            {/* Right Section: Description & Button */}
            <div className="lg:w-1/3 flex flex-col items-end gap-4">
              <p className="text-gray-700 max-w-sm text-right text-sm">
                Online learning offers a new way to explore subjects you're
                passionate about.
              </p>
              <Button
                variant={"mystyle"}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show Less" : "View All"}
              </Button>
            </div>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="mx-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-22">
          <div className="bg-white shadow-md p-4 rounded-lg flex flex-col items-center">
            <Icon
              icon="material-symbols:developer-mode-tv-outline"
              width="120px"
            />
            <h3 className="text-xl font-semibold">Web Development</h3>
            <p className="text-gray-600">10+ courses</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg flex flex-col items-center">
            <Icon
              icon="material-symbols:developer-mode-rounded"
              width="120px"
            />
            <h3 className="text-xl font-semibold">App Development</h3>
            <p className="text-gray-600">15+ courses</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg flex flex-col items-center">
            <Icon icon="pixel:cybersecurity" width="120px" />
            <h3 className="text-xl font-semibold">Cyber Security</h3>
            <p className="text-gray-600">5+ courses</p>
          </div>
        </div>

        {/* Expanded Section */}
        {expanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white shadow-md p-6 rounded-lg flex flex-col items-center">
              <img
                src="/icons/data-science.png"
                alt="Data Science"
                className="w-16 mb-4"
              />
              <h3 className="text-xl font-semibold">Data Science</h3>
              <p className="text-gray-600">12+ courses</p>
            </div>
            <div className="bg-white shadow-md p-6 rounded-lg flex flex-col items-center">
              <img src="/icons/ai.png" alt="AI" className="w-16 mb-4" />
              <h3 className="text-xl font-semibold">Artificial Intelligence</h3>
              <p className="text-gray-600">8+ courses</p>
            </div>
            <div className="bg-white shadow-md p-6 rounded-lg flex flex-col items-center">
              <img
                src="/icons/blockchain.png"
                alt="Blockchain"
                className="w-16 mb-4"
              />
              <h3 className="text-xl font-semibold">Blockchain</h3>
              <p className="text-gray-600">6+ courses</p>
            </div>
          </div>
        )}
      </div>
    );
};

export default PopularSubjects;
