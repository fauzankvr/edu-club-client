import studentAPI from "@/API/StudentApi";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import instructorAPI from "@/API/InstructorApi";
import Loading from "@/components/studentComponents/loading";

const ResetPassword: React.FC = () => {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [initializing, setInitializing] = useState(true); // <-- Initial loading

  const navigate = useNavigate();
  const location = useLocation();

  const email = location?.state?.email;
  const role = location?.state?.role;

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    } else {
      setInitializing(false); // Finish loading
    }
  }, [email, navigate]);

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .trim("Cannot be only spaces")
      .strict(true)
      .min(6, "Minimum 6 characters")
      .matches(/[A-Za-z]/, "Password must contain at least one letter")
      .matches(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      )
      .required("Required"),
    confirmPassword: Yup.string()
      .trim("Cannot be only spaces")
      .strict(true)
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        let res;
        if (role === "student") {
          res = await studentAPI.resetPassword(values.newPassword, email);
        } else {
          res = await instructorAPI.resetPassword(values.newPassword, email);
        }

        if (res.data.success) {
          toast.success("Password reset successful");
          navigate("/", { replace: true });
          navigate(role === "student" ? "/login" : "/instructor/login");
        } else {
          toast.error("Something went wrong");
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to reset password");
      }
    },
  });

  // Show loading screen if checking state
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
            Reset Password
          </h2>
          <p className="text-sm text-center text-green-600 mb-6">
            OTP verification successfully completed
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  disabled={formik.isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                >
                  <Icon icon={showNew ? "mdi:eye-off" : "mdi:eye"} width={20} />
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.newPassword}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  disabled={formik.isSubmitting}
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
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.confirmPassword}
                  </div>
                )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
