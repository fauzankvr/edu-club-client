import { useEffect, useState } from "react";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import { Icon } from "@iconify/react";
import studentAPI from "@/API/StudentApi";
import { toast, ToastContainer } from "react-toastify";
import { getSocket } from "@/services/socketService"; 
import { Socket } from "socket.io-client";

interface Notification {
  _id: string;
  userId: string;
  type: "course_update" | "quiz_reminder" | "message" | "achievement";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      const response = await studentAPI.getNotifications();
      setNotifications(response.data.data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let socketInstance: Socket;

    const initialize = async () => {
      try {
        const student = await studentAPI.getProfile();
        socketInstance = getSocket(student.profile._id);

        // Remove previous listener (if any) before adding a new one
        socketInstance.off("newNotification");

        socketInstance.on("connect", () => {
          console.log(
            `Socket connected for student ${student.profile._id}: ${socketInstance.id}`
          );
        });

        socketInstance.emit("set-role", {
          role: "student",
          userId: student.profile._id,
        });

        socketInstance.on("newNotification", (notification: Notification) => {
          console.log("New notification:", notification);
          setNotifications((prev) => [notification, ...prev]);
          toast.info(`New notification: ${notification.title}`);
        });

        socketInstance.on("error", ({ error }) => {
          console.error("Socket error:", error);
          toast.error(error);
        });

        fetchNotifications();
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to initialize");
      }
    };

    initialize();

    return () => {
      // Proper cleanup
      if (socketInstance) {
        socketInstance.off("newNotification");
        socketInstance.disconnect();
      }
    };
  }, []);
  

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await studentAPI.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center flex items-center justify-center">
          <Icon icon="mdi:bell-outline" className="mr-2" width="28" />
          Your Notifications
        </h1>

        {loading ? (
          <div className="text-center py-10 text-indigo-600 flex flex-col items-center justify-center animate-pulse">
            <p className="text-lg font-medium">Loading your notifications...</p>
            <p className="text-sm text-indigo-400 mt-1">
              Just a moment, we’re fetching your updates.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <p className="text-lg font-semibold mb-2">No new notifications.</p>
            <p className="text-base">
              Stay tuned for updates on your courses and progress!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition ${
                  notification.read ? "opacity-60" : ""
                }`}
              >
                <Icon
                  icon={
                    notification.type === "course_update"
                      ? "mdi:book-open-page-variant"
                      : notification.type === "quiz_reminder"
                      ? "mdi:calendar-check"
                      : notification.type === "message"
                      ? "mdi:message-text-outline"
                      : "mdi:trophy"
                  }
                  className={`mr-3 ${
                    notification.type === "course_update"
                      ? "text-blue-500"
                      : notification.type === "quiz_reminder"
                      ? "text-green-500"
                      : notification.type === "message"
                      ? "text-purple-500"
                      : "text-yellow-500"
                  }`}
                  width="24"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {notification.title}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {notification.message}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification._id);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Icon icon="mdi:check" width="20" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Notifications;
