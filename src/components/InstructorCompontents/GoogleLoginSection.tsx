// components/GoogleLoginSection.tsx
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { NavigateFunction } from "react-router-dom";
import { Dispatch } from "@reduxjs/toolkit";
import studentAPI from "@/API/StudentApi";
import { setStudent } from "@/features/student/redux/studentSlce";

interface GoogleLoginSectionProps {
  dispatch: Dispatch;
  navigate: NavigateFunction;
  googleClientId: string | undefined;
}

export default function GoogleLoginSection({
  dispatch,
  navigate,
  googleClientId,
}: GoogleLoginSectionProps) {
  return (
    <>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with</span>
        </div>
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
                const res = await studentAPI.googleLogin({
                  token,
                  role: "instructor",
                });
                if (res?.data?.success) {
                  dispatch(setStudent(res.data.data.accessToken));
                  localStorage.setItem(
                    "InstructorToken",
                    res.data.data.accessToken
                  );
                  toast.success("Google Signup successful");
                  navigate("/instructor/home", { replace: true });
                } else {
                  toast.error("Google Signup failed");
                }
              } catch (err) {
                console.error("Google signup error:", err);
                toast.error("Google Signup failed");
              }
            }}
            onError={() => toast.error("Google signup failed")}
          />
        ) : (
          <div className="text-red-500 text-sm">
            Google Login is disabled: Missing Client ID
          </div>
        )}
      </div>

      <p className="text-center text-gray-500 mt-6">
        Already have an account?{" "}
        <a
          href="/instructor/login"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Log in
        </a>
      </p>
    </>
  );
}
