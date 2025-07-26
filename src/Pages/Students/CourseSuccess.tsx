import studentAPI from "@/API/StudentApi";
import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import { ICourseData } from "@/Interface/CourseData";
import { Icon } from "@iconify/react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SyncLoader } from "react-spinners";
import { getSocket } from "@/services/socketService";
import { Socket } from "socket.io-client";
import { toast } from "react-hot-toast";

// Define Notification type (aligned with INotification)
interface Notification {
  studentId: string;
  instructorId: string;
  type: "course_update" | "quiz_reminder" | "message" | "achievement";
  title: string;
  message: string;
  read: boolean;
}

function CourseSuccessCard() {
  const [showSuccess, setShowSuccess] = useState(true);
  const [course, setCourse] = useState<ICourseData | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentPurchaseNotificationRef = useRef<boolean>(false); // Track purchase notification
  const { id } = useParams<{ id: string }>(); // Course ID from URL
  const navigate = useNavigate();

  // Fetch student profile to get studentId
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await studentAPI.getProfile();
        console.log("Fetched student profile:", response);
        setStudentId(response.profile._id);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Set up socket listener for notifications
  useEffect(() => {
    if (!studentId) return;

    const socket: Socket = getSocket(studentId);

    socket.on("newNotification", (notification: Notification) => {
      console.log("Received newNotification in CourseSuccessCard:", notification);
      if (notification.type === "achievement") {
        toast.success(notification.message, { duration: 5000 });
        setShowSuccess(true);
      }
    });

    return () => {
      socket.off("newNotification");
    };
  }, [studentId]);

  // Fetch course details and send purchase notification
  useEffect(() => {
    if (!id) {
      setError("Invalid course ID");
      setLoading(false);
      return;
    }

    const fetchCourse = async (courseId: string) => {
      try {
        setLoading(true);
        const response = await studentAPI.findCoursByid(courseId);
        console.log("Fetched course:", response.data);
        setCourse(response.data.data.course);

        // Send purchase notification after course is fetched
        if (studentId && response.data.data.course && !sentPurchaseNotificationRef.current) {
          const notification: Notification = {
            studentId,
            instructorId: response.data.data.course.instructorDetails.id,
            type: "achievement",
            title: "Course Purchase Successful",
            message: `Thank you for purchasing ${response.data.data.course.title}! Start learning now!`,
            read: false,
          };

          // Send notification to backend
          await studentAPI.sendNotification(notification);

          // Emit notification via socket
          const socket = getSocket(studentId);
          socket.emit("newNotification", notification);
          console.log("Purchase notification sent:", notification);

          // Mark notification as sent
          sentPurchaseNotificationRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course details");
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse(id);
  }, [id, studentId]);

  // Update lesson progress API
 

  const handleStart = () => {
    if (id) {
      navigate(`/courses/singlecourse/${id}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center p-16 bg-gray-50">
        {loading ? (
          <div className="w-full max-w-6xl mb-6 p-4 border border-indigo-300 rounded-lg bg-white flex items-center justify-center gap-3">
            <SyncLoader color="#3824da" />
          </div>
        ) : error ? (
          <div className="w-full max-w-6xl mb-6 p-4 border border-red-300 rounded-lg bg-white flex items-center justify-center gap-3">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {showSuccess && (
              <div className="w-full max-w-6xl mb-6 p-4 border border-indigo-300 rounded-lg bg-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon
                    icon="mdi:check-circle-outline"
                    className="text-green-500 w-8 h-8"
                  />
                  <p className="text-gray-700 font-medium">
                    Great choice, Go Ahead{" "}
                    <span className="font-semibold">
                      {studentId ? "Student" : "Guest"}!
                    </span>
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

            {course && (
              <div className="w-full max-w-6xl bg-white border border-indigo-300 rounded-lg shadow-sm hover:shadow-md transition p-6 flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 w-full">
                  <img
                    src={course.courseImageId}
                    alt="Course Thumbnail"
                    className="w-full h-40 md:h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      <span className="font-semibold">Instructor: </span>
                      {course.instructorDetails.fullName}
                    </p>
                  </div>
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