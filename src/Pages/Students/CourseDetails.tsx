import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import RelatedCourses from "@/components/studentComponents/TopRelated";
import CourseContent from "@/components/studentComponents/CourseContant";
import ReviewCard from "@/components/studentComponents/RiviewView";
import InstructorProfile from "@/components/studentComponents/InstructorProfile";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import studentAPI from "@/API/StudentApi";
import { ICourseData } from "@/Interface/CourseData";
import { DotLottieReact } from "@lottiefiles/dotlottie-react"; // Assuming you use this loader
import toast, { Toaster } from "react-hot-toast";

const CourseDetails = () => {
  const [activeTab, setActiveTab] = useState("learn"); // 'learn' or 'content'
  const [course, setCourse] = useState<ICourseData>();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  console.log("state", location.state.course);
  const state = location.state?.course;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) return;
        const res = await studentAPI.findOneCourse(id);
        console.log(res.course)
        setCourse(res.course);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCourse();
  }, [id]);

  const handleBuyNow = async(id:string) => {
    navigate(`/courses/checkout/${id}`);
  }

const handleAddToWishlist = async (courseId: string): Promise<void> => {
  try {
    const response = await studentAPI.addToWishlist(courseId);
    console.log("Added to wishlist:", response.data); 
    toast.success("Success to Add wishlist")
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    toast.error("you alredy added")
  }
};
  return (
    <>
      <Toaster />
      {course ? (
        <>
          <Navbar />
          <div className="bg-gray-100 min-h-screen py-6 px-2 sm:px-6 lg:px-10 xl:px-20">
            <div className="bg-indigo-500 py-8 px-4 rounded-sm mb-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-snug mb-2">
                  {course.title}
                </h1>
                <p className="text-lg text-indigo-100 mb-4 max-w-3xl">
                  Learn web design in 1 hour with 25+ simple-to-use rules and
                  guidelines – tons of amazing web design resources included!
                </p>

                <div className="flex flex-wrap items-center gap-3 text-sm text-indigo-100 mb-4">
                  <span className="flex items-center font-semibold text-yellow-300">
                    {(state?.averageRating ?? 0).toFixed(1)}
                    <Icon
                      icon="ic:round-star"
                      className="text-yellow-400 ml-1 mr-0.5"
                    />
                  </span>
                  <span>{course.students?.length ?? 0} students</span>
                  <span>
                    Created by {" "}
                    <span className="font-medium text-white">
                      {state?.instructor?.name ?? "Unknown"}
                    </span>
                  </span>
                  <span>Language: {course.language}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="border-b border-gray-300 mb-4">
                  <div className="flex flex-wrap gap-12">
                    {["learn", "content", "reviews", "instructor"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`pb-2 font-semibold ${
                            activeTab === tab
                              ? "text-indigo-600 border-b-2 border-indigo-600"
                              : "text-gray-500 hover:text-indigo-600"
                          }`}
                        >
                          {tab === "learn"
                            ? "What you'll learn"
                            : tab === "content"
                            ? "Course content"
                            : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {activeTab === "learn" && (
                  <ul className="space-y-4">
                    {Array.isArray(course.points) &&
                      course.points.length > 0 &&
                      JSON.parse(course.points[0])?.map(
                        (item: { text: string }, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start text-gray-700"
                          >
                            <Icon
                              icon="mdi:check-circle-outline"
                              className="text-indigo-600 text-xl mr-3 mt-1"
                            />
                            <span>{item.text}</span>
                          </li>
                        )
                      )}
                  </ul>
                )}

                {activeTab === "content" && (
                  <CourseContent courseId={course._id} />
                )}
                {activeTab === "reviews" && (
                  <ReviewCard courseId={course._id} />
                )}
                {activeTab === "instructor" && (
                  <InstructorProfile instructor={course.instructorDetails} />
                )}
              </div>

              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4">
                <img
                  src={course.courseImageId}
                  alt="Course preview"
                  className="w-full h-auto rounded-lg mb-4"
                />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ₹{course.price}{" "}
                  {parseInt(course.discount) > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹
                      {Math.round(
                        course.price / (1 - parseInt(course.discount) / 100)
                      )}
                    </span>
                  )}
                </div>
                {parseInt(course.discount) > 0 && (
                  <div className="text-red-600 font-semibold text-sm mb-1">
                    {course.discount}% off
                  </div>
                )}
                <div className="text-sm text-gray-600 mb-4">
                  Limited time offer!
                </div>

                <div className="text-sm text-gray-700 mb-4">
                  <p className="mb-2">This course includes:</p>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <Icon
                        icon="mdi:play-circle-outline"
                        className="text-indigo-600 mr-2 mt-0.5"
                      />
                      1 hour on-demand video
                    </li>
                    <li className="flex items-start">
                      <Icon
                        icon="mdi:file-download-outline"
                        className="text-indigo-600 mr-2 mt-0.5"
                      />
                      7 downloadable resources
                    </li>
                    <li className="flex items-start">
                      <Icon
                        icon="mdi:infinity"
                        className="text-indigo-600 mr-2 mt-0.5"
                      />
                      Full lifetime access
                    </li>
                    <li className="flex items-start">
                      <Icon
                        icon="mdi:cellphone"
                        className="text-indigo-600 mr-2 mt-0.5"
                      />
                      Access on mobile and TV
                    </li>
                    <li className="flex items-start">
                      <Icon
                        icon="mdi:certificate-outline"
                        className="text-indigo-600 mr-2 mt-0.5"
                      />
                      Certificate of completion
                    </li>
                  </ul>
                </div>

                <button
                  className="cursor-pointer border-2 border-indigo-600 hover:border-indigo-700 text-indigo-600 w-full py-3 rounded-lg font-semibold text-sm transition-colors duration-300"
                  onClick={() => handleAddToWishlist(course._id)}
                >
                  Add to Wishlist
                </button>

                <button
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 mt-2 text-white w-full py-3 rounded-lg font-semibold text-sm transition"
                  onClick={() => handleBuyNow(course._id)}
                >
                  Buy Now
                </button>
                <div className="text-xs text-center text-gray-500 mt-3">
                  30-Day Money-Back Guarantee
                </div>
              </div>
            </div>
          </div>
          <RelatedCourses />
          <Footer />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <DotLottieReact src="/loading.lottie" loop autoplay />
        </div>
      )}
    </>
  );
};

export default CourseDetails;
