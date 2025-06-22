import { clearStudent, setAccessToken } from "@/features/student/redux/studentSlce";
import { axiosInstance } from "./axiosInstance";
import { store } from "@/features/student/redux/store"; 
import { ProfileData } from "@/Pages/types/student";


axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith("/instructor")) {
      const accessToken = localStorage.getItem("InstructorToken");
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }       
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.message === "Unauthorized: Token expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axiosInstance.post("/refresh");
        const { accessToken } = response.data;

        // Save new token
        localStorage.setItem("InstructorToken", accessToken);
        store.dispatch(setAccessToken(accessToken));

        // Set token on future requests
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearStudent());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// Student API Methods
const instructorAPI = {
  signup: (formData: object) => {
    return axiosInstance.post("/instructor/signup", formData);
  },

  login: (formdata: object) => {
    return axiosInstance.post("/instructor/login", formdata);
  },

  verifyOtp: (formData: object) => {
    return axiosInstance.post("/instructor/verifyotp", formData);
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
    const res = await axiosInstance.get("/instructor/profile");
    return res.data;
  },

  logout: async () => {
    try {
      await axiosInstance.post("/instructor/logout");
      store.dispatch(clearStudent());
      localStorage.removeItem("InstructorToken");
      window.location.href = "/instructor/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Optional: show toast or fallback redirect
      // window.location.href = "/student/login";
    }
  },
  resendOtp: async (email: object) => {
    return await axiosInstance.post("/instructor/resendOtp", email);
  },
  updateProfile: async (data: ProfileData) => {
    try {
      console.log("Updating profile with data:", data);
      const response = await axiosInstance.put("/instructor/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error; // rethrow so caller can handle it too
    }
  },
  getCourseById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/instructor/getCourse/${id}`);
      console.log(response);
      return response.data.data.course;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error; // Rethrow or handle the error as per your requirements
    }
  },
  createCourse: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post(
        "/instructor/createCourse",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  updateCourse: async (courseId: string, formData: FormData) => {
    try {
      const response = await axiosInstance.post(
        `/instructor/updateCourse/${courseId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  postCarriculam: async (courseId: string, formData: FormData) => {
    try {
      const response = await axiosInstance.post(
        `/instructor/uploadCurriculum/${courseId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log(response);
      return response;
    } catch (error) {
      console.error("Error uploading curriculum:", error);
      throw error;
    }
  },
  updateCurriculum: async (courseId: string, formData: FormData) => {
    try {
      const response = await axiosInstance.put(
        `/instructor/updateCurriculum/${courseId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Curriculum updated:", response);
      return response;
    } catch (error) {
      console.error("Error updating curriculum:", error);
      throw error;
    }
  },
  getAllCourses: async () => {
    try {
      const response = await axiosInstance.get("/instructor/getAllCourses");
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getCurriculumByCourseId: async (courseId: string) => {
    try {
      const response = await axiosInstance.get(
        `/instructor/getCurriculum/${courseId}`
      );
      return response.data.data.curriculum;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getAllChats: async () => {
    return await axiosInstance.get("/instructor/getAllChats");
  },
  getMessages: async (chatId: string) => {
    return await axiosInstance.get(`/instructor/getMessages/${chatId}`);
  },
  postMessage: async (data: {
    chatId: string;
    text: string;
    sender: string;
  }) => {
    return await axiosInstance.post("/instructor/postMessage", data);
  },
  getAllCategories: () => {
    return axiosInstance.get("/admin/category/getNotBlocked");
  },
  getAllLanguages: () => {
    return axiosInstance.get("/admin/language/getAll");
  },
  getWallet: () => {
    return axiosInstance.get("/instructor/wallet");
  },
  getPaypalEmail: () => {
    return axiosInstance.get("/instructor/profile");
  },
  updatePaypalEmail: (email: string) => {
    return axiosInstance.patch("/instructor/updatePaypalEmail", {
      paypalEmail: email,
    });
  },
  requestPayout: (email: string) => {
    return axiosInstance.post("/instructor/requestPayout", {
      paypalEmail: email,
    });
  },
  getCallhistory: (instructorId: string) => {
    return axiosInstance.get(`/instructor/getCallhistory/${instructorId}`);
  },
  getDashboard: (params: any) => {
    return axiosInstance.get("/instructor/dashboard",{params});
  },
};

export default instructorAPI;

