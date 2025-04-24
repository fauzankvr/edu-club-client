import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
// import {  LoginValues, verifyOtp } from "@/API/authapi";
import { useDispatch, useSelector } from "react-redux";
import { RootState} from "@/features/student/redux/store"
import { ToastContainer, toast } from "react-toastify";
// import { AxiosError } from "axios";
import studentAPi from "@/API/StudentApi";
import { setAccessToken } from "@/features/student/redux/studentSlce";
import instructorAPI from "@/API/InstructorApi";


export default function OTPVerification() {
  const location = useLocation()
  const Email = useSelector((state: RootState) => state.student.email);
  const Password = useSelector((state: RootState) => state.student.password);
  const dispatch = useDispatch()
   const access = useSelector((state: RootState) => state.student.accessToken);

  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
 const [timer, setTimer] = useState(() => {
   const saved = localStorage.getItem("otp_timer");
   return saved ? parseInt(saved) : 120;
 });
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
      // Make POST request to resend OTP
      if (location.pathname == "/instructor/otpVerify") {
        await instructorAPI.resendOtp({ email: Email });
      } else {
        await studentAPi.resendOtp({ email: Email });
      }
      setTimer(120);
      localStorage.setItem("otp_timer", "120");
      toast.success("A new OTP has been sent to your email.");
    } catch (error: any) {
      console.error("Resend OTP failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
    }
  };

  const handleChange = (index:number, value:string) => {
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
   const otpinstr = otp.join("");
   const loginValues = { email: Email, otp: otpinstr, password: Password };
    
   try {
     let response;
     if (location.pathname == "/instructor/otpVerify") {
       response = await instructorAPI.verifyOtp(loginValues) 
        if (response.data.accessToken) {
          const { accessToken } = response.data;
          console.log("acc", accessToken);
          dispatch(setAccessToken({ AccessToken: accessToken }));
          localStorage.setItem("InstructorToken", accessToken);
          console.log("access in redux", access);
          toast.success("Your OTP is successful");
          navigate("/instructor/home");
        } else {
          toast.error("Invalid response from server");
        }
     } else {
        response = await studentAPi.verifyOtp(loginValues);
       console.log("Response:", response);
        if (response.data.accessToken) {
          const { accessToken } = response.data;
          console.log("acc", accessToken);
          dispatch(setAccessToken({ AccessToken: accessToken }));
          localStorage.setItem("studentToken", accessToken);
          console.log("access in redux", access);
          toast.success("Your OTP is successful");
          navigate("/");
        } else {
          toast.error("Invalid response from server");
        }
     }
       
   } catch (error:any) {
     console.error("OTP verification failed:", error);
     toast.error(
       error.response?.data?.message ||
         "Something went wrong while verifying OTP"
     );
   }
 };


  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="p-6 w-full max-w-md text-center border rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800">Enter OTP</h2>
          <p className="text-gray-600 mt-2">
            We sent a six-digit code to your email {Email}
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
          <p>
            Didn’t receive OTP?
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
            onClick={() => OtpManage(otp, Email, Password)}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Verify OTP
          </Button>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-indigo-600 underline"
          >
            Go Back
          </button>
        </Card>
      </div>
    </>
  );
}
