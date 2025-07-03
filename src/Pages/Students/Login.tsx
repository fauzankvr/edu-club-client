import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import loginImg from "@/assets/students/loginimg.jpg";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setStudent } from "@/features/student/redux/studentSlce";
import studentApi from "@/API/StudentApi";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const successToast = () => toast.success("Login successful!");
  const failToast = () => toast.error("Login failed");

    useEffect(() => {
        const token = localStorage.getItem("studentToken");
        if (token) {
          navigate("/", { replace: true });
        }
      }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await studentApi.login(values);
        console.log("Login response:", res.data);
        if (res && res.data.success) {
          dispatch(setStudent(res.data.data.accessToken));
          localStorage.setItem("studentToken", res.data.data.accessToken);
          successToast();
          navigate("/", { replace: true });
        } else {
          failToast();
        }
      } catch (error) {
        console.error("Login error:", error);
        failToast();
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
    <GoogleOAuthProvider clientId={googleClientId || ""}>
      <Navbar />
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Left Side: Form */}
          <Card className="p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">LOGIN</h2>

            <form onSubmit={formik.handleSubmit} className="space-y-3">
              <Input
                type="email"
                name="email"
                placeholder="Email *"
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
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-sm">
                  {formik.errors.password}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600">
                <a
                  onClick={() => navigate("/forgetPassword",{state:{role:"student"}})}
                  className="text-indigo-600 cursor-pointer"
                >
                  Forgot Password?
                </a>
                {/* <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label> */}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Log In
              </Button>
            </form>

            <div className="text-center text-gray-500 my-4">
              or sign in with
            </div>
            <div className="flex gap-3 justify-center">
              {googleClientId ? (
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    const token = credentialResponse.credential;
                    if (!token) {
                      toast.error("Google login token is missing.");
                      return;
                    }
                    try {
                      const res = await studentApi.googleLogin({ token ,role:"student" });
                      if (res?.data?.success) {
                        dispatch(setStudent(res.data.data.accessToken));
                        localStorage.setItem(
                          "studentToken",
                          res.data.data.accessToken
                        );
                        successToast();
                        navigate("/", { replace: true });
                      } else {
                        failToast();
                      }
                    } catch (err) {
                      console.error("Google login error:", err);
                      failToast();
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
              Don't have an account?{" "}
              <a href="/signup" className="text-indigo-600">
                Sign Up
              </a>
            </p>
          </Card>

          {/* Right Side: Image */}
          <div className="hidden md:block">
            <img
              src={loginImg}
              alt="Login"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <Footer />
    </GoogleOAuthProvider>
  );
}
