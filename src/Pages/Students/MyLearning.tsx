import { useEffect, useState } from "react";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import studentAPI from "@/API/StudentApi";
import { useNavigate } from "react-router-dom";
import { ICourseData } from "@/Interface/CourseData";
import { IOrder } from "@/Interface/IOrder";

const baseUrl = import.meta.env.VITE_BASE_URL;

export interface IEnrolledCourse {
  courseDetails: ICourseData;
  orderDetails: IOrder;
}

// 🟦 Skeleton card component
const CourseSkeletonCard = () => {
  return (
    <div
      role="status"
      className="animate-pulse flex flex-col border bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-center w-full h-40 bg-gray-300 dark:bg-gray-700">
        <svg
          className="w-10 h-10 text-gray-200 dark:text-gray-600"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 18"
        >
          <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
        </svg>
      </div>
      <div className="p-4 flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-32"></div>
        <div className="h-4 bg-gray-200 rounded-full w-full"></div>
        <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
        <div className="h-2 bg-gray-200 rounded-full w-full"></div>
        <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
        <div className="h-9 bg-gray-300 rounded-md mt-auto"></div>
      </div>
    </div>
  );
};

const MyLearning = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<IEnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEnrolledCourses = async () => {
    try {
      const response = await studentAPI.getEnrolledCourses();
      console.log("Enrolled courses:", response.data);
      setEnrolledCourses(response.data.enrolledCourses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const handleContinue = (courseId: string) => {
    navigate(`/courses/singlecourse/${courseId}`);
  };

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Learning</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CourseSkeletonCard key={index} />
            ))}
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            You have not enrolled in any courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div
                key={course.courseDetails._id}
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition border flex flex-col"
              >
                <img
                  src={`${baseUrl}/${course.courseDetails.courseImageId}`}
                  alt={course.courseDetails.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full w-fit mb-2">
                    {course.courseDetails.category}
                  </span>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {course.courseDetails.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {/* Optionally you can display course instructor */}
                    {/* By {course.courseDetails.instructor} */}
                  </p>

                  {/* Hardcoded Progress (optional) */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: "5%" }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleContinue(course.orderDetails.paypalOrderId)
                    }
                    className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default MyLearning;
