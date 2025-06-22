import Navbar from "@/components/studentComponents/Navbar";
import { SidebarFilters } from "./SidebarFilters";
import { Icon } from "@iconify/react";
import Footer from "@/components/studentComponents/Footer";
import { useEffect, useState } from "react";
import studentAPI from "@/API/StudentApi";
import { ICourseData } from "@/Interface/CourseData";
import { useNavigate } from "react-router-dom";

const Courses = () => {
  const [courses, setCourses] = useState<ICourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 2;
  const [category, setCategory] = useState<string[]>([]);
  const [language, setLanguage] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string;
  }>({});
  const [sortOption, setSortOption] = useState<string>(""); 
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const fetchCourses = async (
    query = "",
    pageNum = 1,
    filters = selectedFilters,
    sort = sortOption
  ) => {
    setLoading(true);
    try {
      const res = await studentAPI.getAllCourses(
        query,
        pageNum,
        limit,
        filters,
        sort
      );
      setCourses(res.courses);
      setTotalPages(res.totalPages);
      setLanguage(res.languages);
      setCategory(res.categories);
      
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(searchQuery, page, selectedFilters, sortOption);
  }, [page, selectedFilters, sortOption]);

  const handleSearch = () => {
    setPage(1);
    fetchCourses(searchQuery, 1);
  };

  const handleCardClick = (id: string,item:ICourseData) => {
    navigate(`/courses/details/${id}`, { state: { course: item } });
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };
  const handleFilterChange = (newFilters: { [key: string]: string }) => {
    setSelectedFilters(newFilters);
    setPage(1); 
  };

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
              <button
                className="bg-indigo-600 text-white px-4 rounded-r-md cursor-pointer"
                onClick={handleSearch}
              >
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
              <div className="relative">
                <button
                  onClick={() => setSortDropdownOpen((prev) => !prev)}
                  className="flex items-center px-4 py-2 border rounded-md bg-white shadow-sm"
                >
                  <Icon icon="mdi:sort" className="text-lg mr-2" />
                  Sort by
                  <span className="ml-1 font-medium capitalize">
                    {sortOption || "Default"}
                  </span>
                </button>

                {sortDropdownOpen && (
                  <div className="absolute mt-2 bg-white border rounded shadow-lg z-10 w-48">
                    {[
                      { label: "A - Z", value: "title-asc" },
                      { label: "Z - A", value: "title-desc" },
                      { label: "Price: Low to High", value: "price-asc" },
                      { label: "Price: High to Low", value: "price-desc" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortOption(option.value);
                          setSortDropdownOpen(false);
                          setPage(1);
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                          sortOption === option.value
                            ? "bg-gray-100 font-semibold"
                            : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {loading
                ? "Loading..."
                : `${courses.length} Results on this page`}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64">
              <SidebarFilters
                category={category}
                language={language}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Course List */}
            <div className="flex-1 grid gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="space-y-8 animate-pulse md:flex md:items-center bg-white p-6 rounded-xl border"
                  >
                    <div className="flex items-center justify-center w-full h-36 bg-gray-300 rounded-sm md:w-52" />
                    <div className="w-full">
                      <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
                      <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
                    </div>
                  </div>
                ))
              ) : courses.length === 0 ? (
                <div className="text-center text-gray-500 col-span-full">
                  No courses found.
                </div>
              ) : (
                <>
                  {courses.map((item) => (
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
                          className="flex-1 flex flex-col justify-between"
                         
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
                            <div className="flex items-center gap-1 text-yellow-500">
                              {Array.from({ length: 5 }).map((_, index) => {
                                const rating = item.averageRating;
                                const isFull = index + 1 <= Math.floor(rating);
                                const isHalf = !isFull && index < rating;

                                return (
                                  <Icon
                                    key={index}
                                    icon={
                                      isFull
                                        ? "mdi:star"
                                        : isHalf
                                        ? "mdi:star-half-full" // or "mdi:star-half"
                                        : "mdi:star-outline"
                                    }
                                  />
                                );
                              })}
                            </div>

                            {/* <div className="flex gap-6 text-sm text-gray-500 mt-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Icon icon="mdi:book-open-page-variant" />
                                Lesson
                              </div>
                              {/* <div className="flex items-center gap-1">
                                <Icon icon="mdi:clock-outline" />
                              </div> */}
                            {/* <div className="flex items-center gap-1">
                                <Icon icon="mdi:account-multiple-outline" />
                                Students {item.students.length}+
                              </div>
                            </div> */}
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
                              className="flex items-center gap-1 rounded-full px-4 py-1 text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                              onClick={() => handleCardClick(item._id, item)}
                            >
                              View course
                              <Icon icon="mdi:arrow-right" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-4 mt-10">
                    <button
                      disabled={page === 1}
                      onClick={handlePrev}
                      className="p-2 rounded-full border bg-white text-indigo-600 border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition"
                    >
                      <Icon icon="mdi:chevron-left" className="text-2xl" />
                    </button>

                    <span className="px-4 py-2 text-sm text-gray-700 font-medium">{`Page ${page} of ${totalPages}`}</span>

                    <button
                      disabled={page === totalPages}
                      onClick={handleNext}
                      className="p-2 rounded-full border bg-white text-indigo-600 border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition"
                    >
                      <Icon icon="mdi:chevron-right" className="text-2xl" />
                    </button>
                  </div>
                </>
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
