import { useState } from "react";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import { Icon } from "@iconify/react";
import instructorAPI from "@/API/InstructorApi"; // Assumed API
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "./Sidbar";

const CreateNotification = () => {
  const [formData, setFormData] = useState({
    type: "course_update",
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    setLoading(true);
    try {
      await instructorAPI.createNotification(formData); // Assumes API endpoint
      toast.success("Notification created successfully");
      setFormData({ type: "course_update", title: "", message: "" });
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
          <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center flex items-center justify-center">
            <Icon icon="mdi:bell-plus-outline" className="mr-2" width="28" />
            Create Notification
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Icon icon="mdi:format-title" className="mr-1" width="20" />
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateNotification;
