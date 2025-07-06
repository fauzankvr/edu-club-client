import { useState, useEffect } from "react";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import { Icon } from "@iconify/react";
import instructorAPI from "@/API/InstructorApi";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "./Sidbar";
import { getSocket } from "@/services/socketService";
import { Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";

const CreateNotification = () => {
  const [formData, setFormData] = useState({
    userId: "",
    type: "course_update",
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeSection, setActiveSection] = useState<"create" | "view">(
    "create"
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);

  interface Student {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }

  interface Notification {
    _id: string;
    studentId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        const instructor = await instructorAPI.getProfile();
        const socketInstance = getSocket(instructor.profile._id);
        setSocket(socketInstance);

        socketInstance.on("connect", () => {
          console.log(
            `Socket connected for instructor ${instructor.profile._id}: ${socketInstance.id}`
          );
        });
        socketInstance.emit("set-role", {
          role: "instructor",
          userId: instructor.profile._id,
        });
        socketInstance.on("error", ({ error }) => {
          console.error("Socket error:", error);
          toast.error(error);
        });

        interface ApiStudent {
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
        }

        interface ApiWalletItem {
          student: ApiStudent;
        }

        interface ApiResponse {
          data: {
            data: ApiWalletItem[];
          };
        }

        const response: ApiResponse = await instructorAPI.getWallet();
        const uniqueStudents: ApiStudent[] = Array.from(
          new Map<string, ApiStudent>(
            response.data.data.map((item: ApiWalletItem) => [
              item.student._id,
              item.student,
            ])
          ).values()
        );
        setStudents(uniqueStudents);
        setFilteredStudents(uniqueStudents);

        // Fetch notifications
        const notificationResponse = await instructorAPI.getNotifications();
        setNotifications(notificationResponse.data.notification || []);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to initialize");
      }
    };

    initialize();

    return () => {
      if (socket) {
        console.log("Disconnecting socket for instructor:", socket.id);
        socket.disconnect();
      }
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student: Student) =>
          student.firstName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setFormData((prev) => ({ ...prev, userId: studentId }));
    setSearchQuery("");
    setFilteredStudents(students);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.userId) {
      toast.error("Please select a student");
      return;
    }
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    setLoading(true);
    try {
      const response = await instructorAPI.createNotification(formData);
      console.log("Notification API response:", response);
      toast.success("Notification created successfully");

      if (socket) {
        const notification = {
          _id: response.data.data._id,
          studentId: formData.userId,
          type: formData.type,
          title: formData.title,
          message: formData.message,
          read: false,
          createdAt: new Date().toISOString(),
        };
        console.log("Emitting notification:", notification);
        socket.emit("newNotification", notification);
        // Update notifications list with new notification
        setNotifications((prev) => [notification, ...prev]);
      }

      setFormData({
        userId: "",
        type: "course_update",
        title: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to create notification:", error);
      toast.error("Failed to create notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 container mx-auto p-6">
          <div className="flex justify-center mb-6">
            <button
              className={`px-4 py-2 mx-2 rounded-md transition border ${
                activeSection === "create"
                  ? "bg-indigo-200 text-indigo-800"
                  : "hover:bg-indigo-200"
              }`}
              onClick={() => setActiveSection("create")}
            >
              Create Notification
            </button>
            <button
              className={`px-4 py-2 mx-2 rounded-md transition border ${
                activeSection === "view"
                  ? "bg-indigo-200 text-indigo-800"
                  : "hover:bg-indigo-200"
              }`}
              onClick={() => setActiveSection("view")}
            >
              View Notifications
            </button>
          </div>

          {activeSection === "create" ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center flex items-center justify-center">
                <Icon
                  icon="mdi:bell-plus-outline"
                  className="mr-2"
                  width="28"
                />
                Create Notification
              </h1>
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Icon
                        icon="mdi:account-search"
                        className="mr-1"
                        width="20"
                      />
                      Select Student
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Search by name or email"
                    />
                    {searchQuery && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <div
                              key={student._id}
                              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => handleStudentSelect(student._id)}
                            >
                              <Icon
                                icon="mdi:account"
                                className="mr-2"
                                width="20"
                              />
                              {student.firstName} {student.lastName} (
                              {student.email})
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500">
                            No students found
                          </div>
                        )}
                      </div>
                    )}
                    {formData.userId && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected:{" "}
                        {
                          students.find((s) => s._id === formData.userId)
                            ?.firstName
                        }{" "}
                        {
                          students.find((s) => s._id === formData.userId)
                            ?.lastName
                        }{" "}
                        (
                        {students.find((s) => s._id === formData.userId)?.email}
                        )
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Icon
                        icon="mdi:format-list-bulleted-type"
                        className="mr-1"
                        width="20"
                      />
                      Notification Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="course_update">Course Update</option>
                      <option value="quiz_reminder">Quiz Reminder</option>
                      <option value="message">Message</option>
                      <option value="achievement">Achievement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Icon
                        icon="mdi:format-title"
                        className="mr-1"
                        width="20"
                      />
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter notification title"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Icon
                        icon="mdi:message-text-outline"
                        className="mr-1"
                        width="20"
                      />
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter notification message"
                      rows={5}
                      maxLength={500}
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition text-sm font-semibold flex items-center justify-center mx-auto ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Icon icon="mdi:send" className="mr-2" width="20" />
                      {loading ? "Sending..." : "Send Notification"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center flex items-center justify-center">
                <Icon icon="mdi:bell-outline" className="mr-2" width="28" />
                Sent Notifications
              </h1>
              <Card className="p-4 sm:p-6 shadow-md">
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center">
                      No notifications sent yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <Card
                          key={notification._id}
                          className="p-4 shadow-sm border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {notification.message}
                              </p>
                              <p className="text-sm text-gray-500">
                                Sent to:{" "}
                                {students.find(
                                  (s) => s._id === notification.studentId
                                )?.firstName || "Unknown"}{" "}
                                {students.find(
                                  (s) => s._id === notification.studentId
                                )?.lastName || ""}{" "}
                                (
                                {students.find(
                                  (s) => s._id === notification.studentId
                                )?.email || "Unknown"}
                                )
                              </p>
                              <p className="text-sm text-gray-500">
                                Type:{" "}
                                {notification.type
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Sent:{" "}
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Status: {notification.read ? "Read" : "Unread"}
                              </p>
                            </div>
                            <div>
                              <Icon
                                icon={
                                  notification.read ? "mdi:eye" : "mdi:eye-off"
                                }
                                width={24}
                                className={
                                  notification.read
                                    ? "text-green-500"
                                    : "text-gray-400"
                                }
                              >
                                <title>{notification.read ? "Read" : "Unread"}</title>
                              </Icon>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateNotification;
