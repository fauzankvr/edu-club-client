import { IOtpResponse, ISignupResonse, IStudentSingup } from "@/Interface/SignupVal";
import {axiosInstance} from "./axiosInstance";
import axios, { AxiosResponse, isAxiosError } from "axios";

export interface LoginValues {
  email: string;
  otp: string;
  password:string
}

export const signup = async (
  values: IStudentSingup
): Promise<ISignupResonse | undefined> => {
  try {
    const response = await axiosInstance.post<ISignupResonse>(
      "/student/signup",
      values
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.log(error.response.data.error);
      throw new Error(error.response.data.error || "Signup failed");
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Something went wrong during signup");
    }
  }
};

export const verifyOtp = async (
  values: LoginValues
): Promise<AxiosResponse<IOtpResponse> | undefined> => {
  try {
    const res = await axiosInstance.post<IOtpResponse>("verify_otp", values);
    return res;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      // Forward the actual message from backend
      throw new Error(error.response.data.message || "OTP verification failed");
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Something went wrong");
    }
  }
};


