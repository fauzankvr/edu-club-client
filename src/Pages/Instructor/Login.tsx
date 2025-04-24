import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import loginImg from "@/assets/students/loginimg.jpg";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setStudent } from "@/features/student/redux/studentSlce";
import studentApi from "@/API/StudentApi"; // make sure this exists
import Navbar from "@/components/InstructorCompontents/Navbar";
import Footer from "@/components/InstructorCompontents/Footer";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const successToast = () => toast.success("Login successful!");
  const failToast = () => toast.error("Login failed");

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
        console.log("Login response:", res);
        if (res && res.data.success) {
          dispatch(setStudent(res.data.accessToken));
          localStorage.setItem("InstructorToken", res.data.accessToken);
          successToast();
          navigate("/instructor/home");
        } else {
          failToast();
        }
      } catch (error) {
        console.error("Login error:", error);
        failToast();
      }
    },
  });

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Left Side: Form */}
          <Card className="p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              INSTRUCTOR LOGIN
            </h2>

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

              <Input
                type="password"
                name="password"
                placeholder="Password *"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-sm">
                  {formik.errors.password}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600">
                <a href="#" className="text-indigo-600">
                  Forgot Password?
                </a>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
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
              <Button variant="outline" className="flex items-center gap-2">
                <Icon icon="flat-color-icons:google" className="text-xl" />
                Google
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Icon icon="logos:facebook" className="text-xl" />
                Facebook
              </Button>
            </div>

            <p className="text-center text-gray-500 mt-4">
              Don't have an account?{" "}
              <a href="/student/signup" className="text-indigo-600">
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
    </>
  );
}
