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


export default function Signup() {
  const dispatch = useDispatch()
   const successTost = () => toast.success("Signup successful!");
   const faileTost = () => toast.error("Signup failed. Try again.");
  const navigate = useNavigate()
  //  Formik Setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim("Cannot be only spaces")
        .strict(true)
        .email("Invalid email")
        .required("Required"),

      password: Yup.string()
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
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await signup(values);
        console.log(res);
        if (res && res.success) {
          console.log("Signup success:", res.result.message);
          dispatch(
            setStudent({ email: values.email, password: values.password })
          );
          successTost();
          navigate("/otp-verification");
        } else {
          faileTost();
        }
      } catch (error) {
        console.log("Signup error:", error);
        faileTost();
      }
    },
  });

  return (
    <>
      <Navbar />
      <ToastContainer/>
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

              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.confirmPassword}
                  </div>
                )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Sign Up
              </Button>
            </form>

            <div className="text-center text-gray-500 my-4">
              or sign up with
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Icon icon="flat-color-icons:google" className="text-xl" /> Sign
                In With Google
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Icon icon="logos:facebook" className="text-xl" /> Sign With
                Facebook
              </Button>
            </div>

            <p className="text-center text-gray-500 mt-4">
              Do you have an account?{" "}
              <a href="#" className="text-indigo-600">
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
    </>
  );
}
