import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import singupimg from "@/assets/students/singupimg.jpg";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import {ToastContainer,toast} from "react-toastify"
import { useDispatch } from "react-redux";
import { setStudent } from "@/features/student/redux/studentSlce";
import { signup } from "@/API/authapi";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import studentAPI from "@/API/StudentApi";


export default function Signup() {
  const dispatch = useDispatch()
   const successTost = () => toast.success("Signup successful!",{autoClose: 3000});
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

   useEffect(() => {
          const token = localStorage.getItem("studentToken");
          if (token) {
            navigate("/", { replace: true });
          }
        }, [navigate]);

  //  Formik Setup
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .trim("Cannot be only spaces")
        .strict(true)
        .matches(
          /^[A-Za-z\s\-']+$/,
          "Only letters, spaces, hyphens, and apostrophes allowed"
        )
        .min(2, "Too short")
        .max(30, "Too long")
        .required("First name is required"),
      lastName: Yup.string()
        .trim("Cannot be only spaces")
        .strict(true)
        .max(30, "Too long")
        .required("Last name is required"),
      email: Yup.string()
        .trim("Cannot be only spaces")
        .strict(true)
        .email("Invalid email")
        .required("Email Required"),

      password: Yup.string()
        .trim("Cannot be only spaces")
        .strict(true)
        .min(6, "Minimum 6 characters")
        .max(30, "Password must not exceed 30 characters")
        .matches(/[A-Za-z]/, "Password must contain at least one letter")
        .matches(
          /[^A-Za-z0-9]/,
          "Password must contain at least one special character"
        )
        .required("Password Required"),

      confirmPassword: Yup.string()
        .trim("Cannot be only spaces")
        .strict(true)
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await signup(values);
        if (res && res.success) {
          dispatch(
            setStudent({  email: values.email, password: values.password })
          );
          successTost();
          navigate("/otp-verification", {
            state: { firstName:values.firstName ,lastName:values.lastName , email: values.email, password: values.password },
          });
        } else {
          toast.error(res?.message || "Signup failed. Please try again.");
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(axiosError.message || "Signup failed. Please try again.");
      }
    },
  });
  const googleClientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    console.error(
      "Google Client ID is missing. Please set VITE_REACT_APP_GOOGLE_CLIENT_ID in your .env file."
    );
  }

  return (
    <>
      <GoogleOAuthProvider clientId={googleClientId || ""}>
        <Navbar />
        <ToastContainer />
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
          <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Left Side: Form */}
            <Card className="p-6 flex flex-col justify-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                SIGN UP
              </h2>

              {/* Formik form */}
              <form onSubmit={formik.handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.firstName}
                  </div>
                )}
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.lastName}
                  </div>
                )}
                <Input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.email}
                  </div>
                )}
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password *"
                    autoComplete="new-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Icon
                    icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                    className="absolute right-3 top-3 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>

                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.password}
                  </div>
                )}

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password *"
                    autoComplete="new-password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Icon
                    icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                    className="absolute right-3 top-3 cursor-pointer text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.confirmPassword}
                    </div>
                  )}

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>

              <div className="text-center text-gray-500 my-4">
                or sign up with
              </div>
              <div className="flex justify-center">
                {googleClientId ? (
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      const token = credentialResponse.credential;
                      if (!token) {
                        toast.error("Google login token is missing.");
                        return;
                      }
                      try {
                        const res = await studentAPI.googleLogin({ token ,role:"student"});
                        if (res?.data?.success) {
                          dispatch(setStudent(res.data.data.accessToken));
                          localStorage.setItem(
                            "studentToken",
                            res.data.data.accessToken
                          );
                          toast.success("Google login successful!");
                          navigate("/",{replace:true});
                        } else {
                          toast.error("Google login failed. Please try again.");
                        }
                      } catch (err) {
                        console.error("Google login error:", err);
                        toast.error("Google login failed. Please try again.");
                      }
                    }}
                    onError={() => toast.error("Google login failed")}
                  />
                ) : (
                  <div className="text-red-500 text-sm">
                    Google Login is disabled: Missing Client ID
                  </div>
                )}
              </div>

              <p className="text-center text-gray-500 mt-4">
                Do you have an account?{" "}
                <a
                  href="
              /login"
                  className="text-indigo-600"
                >
                  Log in
                </a>
              </p>
            </Card>

            {/* Right Side: Image */}
            <div className="hidden md:block">
              <img
                src={singupimg}
                alt="Signup"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <Footer />
      </GoogleOAuthProvider>
    </>
  );
}
