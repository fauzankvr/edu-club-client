import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setStudent } from "@/features/student/redux/studentSlce";
import loginImg from "@/assets/students/loginimg.jpg";
import adminApi from "@/API/adminApi";

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
        const res = await adminApi.login(values);
        if (res && res.data.success) {
          dispatch(setStudent(res.data.accessToken));
          localStorage.setItem("accessTokenAdmin", res.data.accessToken);
          successToast();
          navigate("/admin/dashboard");
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
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100 p-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Left Side: Image */}
          <div className="hidden md:block">
            <img
              src={loginImg}
              alt="Login visual"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right Side: Form */}
          <Card className="p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Admin Login
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-2 rounded-xl"
              >
                Log In
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
