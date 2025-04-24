import {axiosInstance} from "./axiosInstance";
import { store } from "@/features/student/redux/store";
import { setAccessToken,clearStudent } from "@/features/student/redux/studentSlce";
import { ProfileData } from "@/Pages/types/student";

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith("/student")) {
      // const accessToken = store.getState().student.accessToken;
      const accessToken = localStorage.getItem("studentToken");
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and token refresh
axiosInstance.interceptors.response.use(
  (response) => response, async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (
      error.response &&
      error.response.status === 401 &&
      error.config?.url?.startsWith("/student") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axiosInstance.post("/refresh");
        const { accessToken } = response.data;
        store.dispatch(setAccessToken(accessToken));
        localStorage.setItem("studentToken", accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        store.dispatch(clearStudent());
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Student API Methods
const studentAPI = {
  login: (formdata: object) => {
    return axiosInstance.post("/student/login", formdata);
  },

  verifyOtp: (formData: object) => {
    return axiosInstance.post("/student/verifyotp", formData);
  },

  fetchCourse: (
    query1?: string,
    query2?: string,
    price?: string,
    page?: number
  ) => {
    return axiosInstance.get(
      `/student/get_course?search=${query1}&category=${query2}&price=${price}&page=${page}`
    );
  },

  getProfile: async () => {
    return await axiosInstance.get("/student/profile").then((res) => res.data);
  },

  logout: async () => {
    try {
      await axiosInstance.post("/student/logout");
      store.dispatch(clearStudent());
      localStorage.removeItem("studentToken");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Optional: show toast or fallback redirect
      // window.location.href = "/student/login";
    }
  },
  resendOtp: async (email: object) => {
    return await axiosInstance.post("/student/resendOtp", email);
  },
  updateProfile: async (data: ProfileData) => {
    try {
      console.log("Updating profile with data:", data);
      const response = await axiosInstance.put("/student/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  },
  getStudent: async () => {
    try {
      const response = await axiosInstance.get("/student");
      console.log(response);
      return response;
    } catch (error) {
      console.error("Fetching student failed:", error);
      throw error;
    }
  },
  getAllCourses: async () => {
    try {
      const response = await axiosInstance.get("/student/getAllCourses");
      return response.data;
    } catch (error) {
      console.error("Fetching courses failed:", error);
      throw error;
    }
  },
};

export default studentAPI;
