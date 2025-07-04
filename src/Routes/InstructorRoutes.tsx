import { Routes, Route } from "react-router-dom";
import InstructorHome from "@/Pages/Instructor/Home";
import DashboardOverview from "@/Pages/Instructor/Dashboard";
import Courses from "@/Pages/Instructor/Courses";
import LandingPage from "@/Pages/Instructor/LandingPage";
import Carricculam from "@/Pages/Instructor/Carriculam";
import Profile from "@/Pages/Instructor/Profile";
import Login from "@/Pages/Instructor/Login";
import Signup from "@/Pages/Instructor/Signup";
import OTPVerification from "@/Pages/Students/OtpPage";
import ChatApp from "@/Pages/Instructor/ChaApp";
import ProtectedRoute from "@/Middleware/ProtectedRouteIn";
import VideoCallApp from "@/Pages/Instructor/VideoList";
import Wallet from "@/Pages/Instructor/Wallet";
import CallHistory from "@/Pages/Instructor/CallHistory";
import NotFoundPage from "@/Pages/Students/Notfound";

const InstructorRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="otpVerify" element={<OTPVerification />} />
      <Route path="home" element={<InstructorHome />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="dashboard/courses" element={<Courses />} />
        <Route path="dashboard/courses/landingpage" element={<LandingPage />} />
        <Route
          path="dashboard/courses/landingpage/:id"
          element={<LandingPage />}
        />
        <Route
          path="dashboard/courses/editcarriculam/:id"
          element={<Carricculam />}
        />
        <Route
          path="dashboard/courses/addcarriculam/:id"
          element={<Carricculam />}
        />
        <Route path="profile" element={<Profile />} />
        <Route path="dashboard/chatlist" element={<ChatApp />} />
        <Route path="dashboard/video-call" element={<VideoCallApp />} />
        <Route path="dashboard/call-history" element={<CallHistory />} />
        <Route path="dashboard/wallet" element={<Wallet />} />
      </Route>
    </Routes>
  );
};

export default InstructorRoutes;
