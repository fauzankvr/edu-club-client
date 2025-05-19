import { Icon } from "@iconify/react";

const RelatedCourses = () => {
  const courses = [1, 2, 3]; // Placeholder array for demo

  return (
    <div className="px-4 sm:px-6 lg:px-24 xl:px-40 py-10">
      <h2 className="text-xl font-semibold mb-6">Related courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((_, idx) => (
          <div
            key={idx}
            className="border border-indigo-200 rounded-xl p-4 shadow hover:shadow-md transition"
          >
            <img
              src="https://img-c.udemycdn.com/course/240x135/1452908_8741_3.jpg"
              alt="Course"
              className="rounded-lg mb-4 w-full object-cover h-40"
            />

            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
              Digital Marketing
            </span>

            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="text-orange-500 flex items-center font-semibold">
                <Icon icon="ic:round-star" className="mr-0.5 text-lg" />
                4.5k
              </span>
              <span className="ml-auto text-gray-500 line-through text-xs">
                ₹2400
              </span>
              <span className="text-indigo-600 font-semibold text-sm">
                ₹550
              </span>
            </div>

            <h3 className="text-md font-bold mt-2 text-gray-800">
              It Statistics Data Science And Business Analysis
            </h3>

            <div className="flex items-center gap-4 text-xs text-gray-600 mt-3">
              <span className="flex items-center gap-1">
                <Icon
                  icon="mdi:book-open-page-variant"
                  className="text-indigo-600"
                />
                Lesson 10
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="mdi:clock-outline" className="text-indigo-600" />
                9h 30m
              </span>
              <span className="flex items-center gap-1">
                <Icon
                  icon="mdi:account-group-outline"
                  className="text-indigo-600"
                />
                Students 20+
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:account-circle"
                  className="text-indigo-600 text-2xl"
                />
                <span className="text-sm font-medium">Samantha</span>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1 rounded-full transition">
                Enroll
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedCourses;
