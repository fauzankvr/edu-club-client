import { Routes, Route } from "react-router-dom";
import Home from "../Pages/Students/Home";
import Signup from "@/Pages/Students/Signup";
import Login from "@/Pages/Students/Login";
import ForgotPassword from "@/Pages/Students/ForgottPass";
import OTPVerification from "@/Pages/Students/OtpPage";
import ProfilePage from "@/Pages/Students/ProfilePage";
import { Fragment } from "react";
import Courses from "@/Pages/Students/Courses";

const StudentRoute = () => {
  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotten" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/courses" element={ <Courses/>} />
      </Routes>
    </Fragment>
  );
};

export default StudentRoute;
