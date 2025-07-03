import React from "react";

const SkeletonLoader: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Video/PDF Player and Tabs */}
        <div className="lg:col-span-2">
          {/* Video/PDF Player Skeleton */}
          <div className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center relative">
            <div className="w-full h-full bg-gray-300 rounded-xl"></div>
          </div>

          {/* Course Progress Skeleton */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-gray-200 rounded"></div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div className="bg-gray-300 h-2.5 rounded-full w-1/3"></div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex space-x-12 mt-6 border-b">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="py-2 w-20 h-8 bg-gray-200 rounded-t-md"
              ></div>
            ))}
          </div>

          {/* Content Area Skeleton */}
          <div className="mt-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-4 w-full bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Course Content Skeleton */}
        <div className="bg-white border rounded-xl p-6 w-full max-w-md mx-auto">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4">
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2 px-6 py-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded"></div>
                        <div className="ml-auto flex items-center gap-2">
                          <div className="h-4 w-8 bg-gray-200 rounded"></div>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
