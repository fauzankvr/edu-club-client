import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import studentAPi from "@/API/StudentApi";
import instructorAPI from "@/API/InstructorApi";
import { AxiosError } from "axios";
import Loading from "@/components/studentComponents/loading";

export default function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(() => {
    const saved = localStorage.getItem("otp_timer");
    return saved ? parseInt(saved) : 120;
  });

  const [loading, setLoading] = useState(false); // <-- For verifying OTP
  const [initializing, setInitializing] = useState(true); // <-- For first render

  const { fullName, firstName, lastName, password, role } =
    location.state || {};
  const email = location?.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/login");
    } else {
      setInitializing(false); // Done loading
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) {
      localStorage.removeItem("otp_timer");
      return;
    }

    localStorage.setItem("otp_timer", timer.toString());

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOtp = async () => {
    if (timer > 0) {
      toast.info("Please wait for the timer to expire before resending OTP.");
      return;
    }

    try {
      if (!password) {
        await studentAPi.sendOtp(email);
      } else if (location.pathname === "/instructor/otpVerify") {
        await instructorAPI.resendOtp(email);
      } else {
        await studentAPi.resendOtp(email);
      }
      setTimer(120);
      localStorage.setItem("otp_timer", "120");
      toast.success("A new OTP has been sent to your email.");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      (document.getElementById(`otp-${index + 1}`) as HTMLElement).focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      (document.getElementById(`otp-${index - 1}`) as HTMLElement).focus();
    }
  };

  const OtpManage = async (otp: string[], Email: string, Password: string) => {
    setLoading(true); // Start loading

    const otpinstr = otp.join("");
    const loginValues = {
      fullName,
      firstName,
      lastName,
      email: Email,
      otp: otpinstr,
      password: Password,
    };

    try {
      let response;
      if (location.pathname === "/instructor/otpVerify") {
        response = await instructorAPI.verifyOtp(loginValues);
        if (response.data.success) {
          toast.success("Your OTP is successful");
          navigate("/instructor/login", { replace: true });
        }
      } else {
        if (!loginValues.password) {
          const res = await studentAPi.ForgotverifyOtp(loginValues);
          if (res.data.success) {
            toast.success("OTP verified successfully");
            navigate("/resetPassword", {
              state: { email: email, role: role },
              replace: true,
            });
          } else {
            toast.error("Invalid OTP");
          }
        } else {
          response = await studentAPi.verifyOtp(loginValues);
          if (response.data.success) {
            toast.success("Your OTP is successful");
            navigate("/login", { replace: true });
          } else {
            toast.error("Invalid response from server");
          }
        }
      }
    } catch (error) {
      const errorMessage = error as AxiosError<{
        message?: string;
        error?: string;
      }>;
      toast.error(
        errorMessage.response?.data?.message ||
          errorMessage.response?.data?.error ||
          "Something went wrong while verifying OTP"
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // First time loading spinner
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
       <Loading/>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="p-6 w-full max-w-md text-center border rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800">Enter OTP</h2>
          <p className="text-gray-600 mt-2">
            We sent a six-digit code to your email {email}
          </p>
          <div className="flex justify-center gap-2 my-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl border rounded-md"
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            OTP expires in{" "}
            <span className="text-indigo-600">
              {Math.floor(timer / 60)}:
              {(timer % 60).toString().padStart(2, "0")}
            </span>
          </p>
          <p className="mt-1">
            Didn’t receive OTP?{" "}
            {timer === 0 ? (
              <a
                onClick={handleResendOtp}
                className="text-indigo-600 cursor-pointer"
              >
                Resend OTP
              </a>
            ) : (
              <span className="text-gray-400">Resend OTP</span>
            )}
          </p>
          <Button
            onClick={() => OtpManage(otp, email, password)}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            disabled={loading}
          >
            {loading ? "Verifying OTP..." : "Verify OTP"}
          </Button>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-indigo-600 underline cursor-pointer"
            disabled={loading}
          >
            Go Back
          </button>
        </Card>
      </div>
    </>
  );
}
