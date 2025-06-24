import studentAPI from "@/API/StudentApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate()
    const location = useLocation()
    const {email} = location.state

  const handleReset = async(e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    console.log("Resetting password to:", newPassword);
      const res = await studentAPI.resetPassword(newPassword,email)
      if (res.data.success) {
          toast.success("Reset Password Success")
          navigate("/login")
      } else {
          toast.error("somthing wrong")
      }
  };

    return (
      <>
        <ToastContainer />
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-sm text-center text-green-600 mb-6">
              OTP verification successfully completed
            </p>

            <form onSubmit={handleReset} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  >
                    <Icon
                      icon={showNew ? "mdi:eye-off" : "mdi:eye"}
                      width={20}
                    />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    >
                      <Icon
                        icon={showConfirm ? "mdi:eye-off" : "mdi:eye"}
                        width={20}
                      />
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </>
    );
};

export default ResetPassword;
