import Navbar from "@/components/studentComponents/Navbar";
import SidebarFilters from "./SidebarFilters";
import { Icon } from "@iconify/react";
import Footer from "@/components/studentComponents/Footer";
import { useEffect, useState } from "react";
import studentAPI from "@/API/StudentApi";
import { ICourseData } from "@/Interface/CourseData";
const baseUrl = import.meta.env.VITE_BASE_URL;

const Courses = () => {
  const [courses, setCourses] = useState<ICourseData[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await studentAPI.getAllCourses();
        console.log(res.courses);
        setCourses(res.courses);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Find Your best courses to{" "}
              <span className="text-indigo-600 font-bold">BOOST</span> your
              skills
            </h1>
            <div className="mt-4 flex justify-center">
              <input
                type="text"
                placeholder="Find Your course .........."
                className="px-4 py-2 w-72 rounded-l-md border border-gray-300"
              />
              <button className="bg-indigo-600 text-white px-4 rounded-r-md">
                Search
              </button>
            </div>
          </div>

          {/* Filter and Sort */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex gap-3 mb-4 md:mb-0">
              <button className="flex items-center px-4 py-2 border rounded-md bg-white shadow-sm">
                <Icon icon="mdi:filter-variant" className="text-lg mr-2" />
                Filter
              </button>
              <button className="flex items-center px-4 py-2 border rounded-md bg-white shadow-sm">
                <Icon icon="mdi:sort" className="text-lg mr-2" />
                Sort by <span className="ml-1 font-medium">Highest rated</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {courses.length} Results
            </div>
          </div>

          {/* Sidebar + Course Cards */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-64">
              <SidebarFilters />
            </div>

            {/* Course List */}
            <div className="flex-1 grid gap-6">
              {courses.map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow rounded-xl p-4 md:p-6 border border-indigo-100 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={`${baseUrl}/${item.courseImageId}`}
                      alt="Course"
                      className="w-full md:w-52 h-32 md:h-36 object-cover rounded-md"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-medium">
                          {item.category}
                        </span>
                        <h2 className="text-lg md:text-xl font-semibold mt-2 text-gray-800">
                          {item.title}
                        </h2>

                        <div className="flex justify-end">
                          <div className="flex items-end text-right">
                            <div className="text-gray-400 line-through text-lg mr-4">
                              ₹{item.price}
                            </div>
                            <div className="text-indigo-600 text-lg font-semibold">
                              ₹
                              {Math.round(
                                item.price -
                                  (item.price * Number(item.discount)) / 100
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-yellow-500 mt-1">
                          <Icon icon="mdi:star" /> {item.rating}k
                        </div>

                        <div className="flex gap-6 text-sm text-gray-500 mt-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:book-open-page-variant" /> Lesson{" "}
                            {item.lessons}
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:clock-outline" /> {item.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:account-multiple-outline" />{" "}
                            Students {item.students.length}+
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.instructor.avatar}
                            alt="Instructor"
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {item.instructor.name}
                          </span>
                        </div>

                        <button className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-md">
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Courses;
