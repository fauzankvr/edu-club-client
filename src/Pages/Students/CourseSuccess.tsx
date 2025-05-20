import studentAPI from "@/API/StudentApi";
import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import { ICourseData } from "@/Interface/CourseData";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SyncLoader } from "react-spinners";

function CourseSuccessCard() {
  const [showSuccess, setShowSuccess] = useState(true);
  const { id } = useParams<{ id: string }>(); // `id` can be string or undefined
  const [course, setCourse] = useState<ICourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setLoading(false); 
      return;
    }

    const fetchCourse = async (courseId: string) => {
      try {
        setLoading(true);
        const response = await studentAPI.findCoursByid(courseId);
        console.log("Fetched course:", response.data);
        setCourse(response.data.course);
      } catch (error) {
        console.error("Error fetching course:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse(id);
    }
  }, [id]);

  const handleStart = () => {
    if (id) {
      navigate(`/courses/singlecourse/${id}`);
    }
  };

  return (
    <>
      <Navbar />

      {/* Main content area */}
      <div className="min-h-screen flex flex-col items-center p-16 bg-gray-50">
        {/* Loading overlay in the center */}
        {loading && !id ? (
          <div className="w-full max-w-6xl mb-6 p-4 border border-indigo-300 rounded-lg bg-white flex items-center justify-center gap-3">
            <SyncLoader color="#3824da" />
          </div>
        ) : (
          <>
            {/* Closable Success message */}
            {showSuccess && (
              <div className="w-full max-w-6xl mb-6 p-4 border border-indigo-300 rounded-lg bg-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon
                    icon="mdi:check-circle-outline"
                    className="text-green-500 w-8 h-8"
                  />
                  <p className="text-gray-700 font-medium">
                    Great choice,{" "}
                    <span className="font-semibold">Muhammed Fauzan!</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="text-gray-500 hover:text-red-500 transition"
                >
                  <Icon icon="mdi:close" className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Course Card */}
            {course && (
              <div className="w-full max-w-6xl bg-white border border-indigo-300 rounded-lg shadow-sm hover:shadow-md transition p-6 flex flex-col md:flex-row gap-6">
                {/* Course Image */}
                <div className="md:w-1/3 w-full">
                  <img
                    src={course?.courseImageId}
                    alt="Course Thumbnail"
                    className="w-full h-40 md:h-full object-cover rounded-lg"
                  />
                </div>

                {/* Course Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                      {course?.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      By Jonas Schmedtmann
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">
                        Your progress
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: "5%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Start Course Button */}
                  <button
                    className="mt-4 w-full md:w-40 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
                    onClick={handleStart}
                  >
                    Start Course
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </>
  );
}

export default CourseSuccessCard;
