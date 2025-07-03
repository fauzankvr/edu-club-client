import instructorAPI from "@/API/InstructorApi";
import studentAPI from "@/API/StudentApi";
import Loading from "@/components/studentComponents/loading";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // For OTP send button
  const [initializing, setInitializing] = useState(true); // For initial component loading
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;

  useEffect(() => {
    // Prevent navigation if no role passed
    if (!role) {
      navigate("/login");
    } else {
      setInitializing(false); // Done loading initial state
    }
  }, [role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Enter a valid email address");
        return;
      }

      const res =
        role === "student"
          ? await studentAPI.sendOtp(email)
          : await instructorAPI.sendOtp(email);

      if (res.data.success) {
        navigate("/otp-verification", {
          state: { email, password: "", role },
        });
      }
    } catch (error) {
      const errorMessage = error as AxiosError<{ error?: string }>;
      toast.error(
        errorMessage.response?.data?.error ||
          "Something went wrong while sending OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loading/>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
            Forgot your password?
          </h2>
          <p className="text-sm text-center text-gray-600 mb-6">
            Provide your account email to receive an email <br /> to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Enter Your Email Address:
            </label>
            <div className="flex space-x-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading
                    ? "bg-indigo-400"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white px-4 py-2 rounded-md transition`}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
