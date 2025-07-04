import { Routes, Route } from "react-router-dom";
import Home from "../Pages/Students/Home";
import Signup from "@/Pages/Students/Signup";
import Login from "@/Pages/Students/Login";
import OTPVerification from "@/Pages/Students/OtpPage";
import ProfilePage from "@/Pages/Students/ProfilePage";
import Courses from "@/Pages/Students/Courses";
import CourseDetails from "@/Pages/Students/CourseDetails";
import CheckoutPage from "@/Pages/Students/CheckoutPage";
import CourseSuccessCard from "@/Pages/Students/CourseSuccess";
import SingleCourse from "@/Pages/Students/SingleCourse";
import Wishlist from "@/Pages/Students/Wishlist";
import MyLearning from "@/Pages/Students/MyLearning";
import ProtectedRoute from "@/Middleware/ProtectedRouteStd";
import VideoCallApp from "@/Pages/Students/VideoCall";
import Plans from "@/Pages/Students/Plans";
import PlanCheckout from "@/Pages/Students/PlanCheckout";
import AboutUs from "@/Pages/Students/AboutUs"; 
import ResetPassword from "@/Pages/Students/ResetPassword";
import ForgotPassword from "@/Pages/Students/ForgotPassword";
import NotFoundPage from "@/Pages/Students/Notfound";
import ProfileCard from "@/Pages/Students/InstructorProfile";
import Notifications from "@/Pages/Students/Notification";

const StudentRoute = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/resetPassword" element={<ResetPassword />} />
      <Route path="/forgetPassword" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/details/:id" element={<CourseDetails />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/instructor-profile/:id" element={<ProfileCard />} />
        <Route path="/courses/checkout/:id" element={<CheckoutPage />} />
        <Route
          path="/courses/checkout/success/:id"
          element={<CourseSuccessCard />}
        />
        <Route path="/courses/singlecourse/:id" element={<SingleCourse />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/mylearning" element={<MyLearning />} />
        <Route path="/video-call" element={<VideoCallApp />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/plans/checkout/:id" element={<PlanCheckout />} />
      </Route>
    </Routes>
  );
};

export default StudentRoute;
