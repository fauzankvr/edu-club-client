import Navbar from "@/components/studentComponents/Navbar";
import SidebarFilters from "./SidebarFilters";
import { Icon } from "@iconify/react";
import Footer from "@/components/studentComponents/Footer";
import { useEffect, useState } from "react";
import studentAPI from "@/API/StudentApi";
import { ICourseData } from "@/Interface/CourseData";
import { useNavigate } from "react-router-dom";

const Courses = () => {
  const [courses, setCourses] = useState<ICourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await studentAPI.getAllCourses();
        setCourses(res.courses);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCardClick = (id: string) => {
    navigate(`/courses/details/${id}`);
  };

  // Filter courses based on search query (case-insensitive)
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-indigo-600 text-white px-4 rounded-r-md cursor-pointer">
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
              {loading ? "Loading..." : `${filteredCourses.length} Results`}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-64">
              <SidebarFilters courses={courses} />
            </div>

            {/* Course List or Skeleton */}
            <div className="flex-1 grid gap-6">
              {loading ? (
                // Skeleton Cards (Repeat 4 times)
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    role="status"
                    className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center bg-white p-6 rounded-xl border"
                  >
                    <div className="flex items-center justify-center w-full h-36 bg-gray-300 rounded-sm md:w-52">
                      <svg
                        className="w-10 h-10 text-gray-200"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 18"
                      >
                        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                      </svg>
                    </div>
                    <div className="w-full">
                      <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
                      <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
                      <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                      <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
                      <div className="h-2 bg-gray-200 rounded-full max-w-[460px] mb-2.5"></div>
                      <div className="h-2 bg-gray-200 rounded-full max-w-[360px]"></div>
                    </div>
                    <span className="sr-only">Loading...</span>
                  </div>
                ))
              ) : filteredCourses.length === 0 ? (
                <div className="text-center text-gray-500 col-span-full">
                  No courses found.
                </div>
              ) : (
                filteredCourses.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white shadow rounded-xl p-4 md:p-6 border border-indigo-100 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={item.courseImageId}
                        alt="Course"
                        className="w-full md:w-52 h-32 md:h-36 object-cover rounded-md"
                      />

                      <div
                        className="flex-1 flex flex-col justify-between cursor-pointer"
                        onClick={() => handleCardClick(item._id)}
                      >
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
                                    (item.price * +item.discount) / 100
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-yellow-500 mt-1">
                            <Icon icon="mdi:star" />
                          </div>

                          <div className="flex gap-6 text-sm text-gray-500 mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Icon icon="mdi:book-open-page-variant" />
                              Lesson
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon icon="mdi:clock-outline" />
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon icon="mdi:account-multiple-outline" />
                              Students {item.students.length}+
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.instructor.profileImage}
                              alt="Instructor"
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {item.instructor.name}
                            </span>
                          </div>

                          <button
                            className="flex items-center gap-1 rounded-full px-4 py-1 text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                            onClick={() => handleCardClick(item._id)}
                          >
                            View course
                            <Icon icon="mdi:arrow-right" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Courses;
