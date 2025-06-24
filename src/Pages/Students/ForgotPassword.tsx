import studentAPI from "@/API/StudentApi";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate()

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    console.log("Send reset link to:", email);
      const res = await studentAPI.sendOtp(email)
      if (res.data.success) {
            navigate("/otp-verification",{state:{email:email,password:""}});
      } else {
          toast.error("Invailed Otp")
          
      }
  };

    return (
        <>
            <ToastContainer/>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
              Forgot your password?
            </h2>
            <p className="text-sm text-center text-gray-600 mb-6">
              Provide your account email to receive an email <br /> to reset
              your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
};

export default ForgotPassword;
