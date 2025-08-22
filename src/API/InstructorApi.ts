import { clearStudent } from "@/features/student/redux/studentSlce";
import { axiosInstance } from "./axiosInstance";
import { store } from "@/features/student/redux/store";
import type { InstructorFormData, Teacher } from "@/Pages/types/instructor";

import {
  INSTRUCTOR_SIGNUP_API,
  INSTRUCTOR_LOGIN_API,
  INSTRUCTOR_VERIFY_OTP_API,
  INSTRUCTOR_SEND_OTP_API,
  INSTRUCTOR_RESET_PASSWORD_API,
  INSTRUCTOR_CHANGE_PASSWORD_API,
  INSTRUCTOR_PROFILE_API,
  INSTRUCTOR_LOGOUT_API,
  INSTRUCTOR_RESEND_OTP_API,
  INSTRUCTOR_CREATE_COURSE_API,
  INSTRUCTOR_GET_ALL_COURSES_API,
  INSTRUCTOR_GET_ALL_CHATS_API,
  INSTRUCTOR_POST_MESSAGE_API,
  INSTRUCTOR_GET_ALL_CATEGORIES_API,
  INSTRUCTOR_GET_ALL_LANGUAGES_API,
  INSTRUCTOR_WALLET_API,
  INSTRUCTOR_UPDATE_PAYPAL_EMAIL_API,
  INSTRUCTOR_REQUEST_PAYOUT_API,
  INSTRUCTOR_DASHBOARD_API,
  INSTRUCTOR_CREATE_NOTIFICATION_API,
  INSTRUCTOR_GET_NOTIFICATIONS_API,
} from "@/constants/instructorApi";

const buildFormData = (data: Teacher) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "profileImage" && value instanceof File) {
      formData.append("profileImage", value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value.toString());
    }
  });

  return formData;
};

// Student API Methods
const instructorAPI = {
  signup: async (data: InstructorFormData) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "profileImage" && value instanceof File) {
        formData.append("profileImage", value);
      } else if (key === "certificateFiles" && Array.isArray(value)) {
        value.forEach((file: File) => {
          formData.append("certificates", file);
        });
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        formData.append(key, JSON.stringify(value));
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "string" || typeof value === "number") {
        formData.append(key, value.toString());
      }
    });

    return axiosInstance.post(INSTRUCTOR_SIGNUP_API, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  login: (formdata: object) => {
    return axiosInstance.post(INSTRUCTOR_LOGIN_API, formdata);
  },

  verifyOtp: (formData: object) => {
    return axiosInstance.post(INSTRUCTOR_VERIFY_OTP_API, formData);
  },
  sendOtp: (email: string) => {
    return axiosInstance.post(INSTRUCTOR_SEND_OTP_API, { email });
  },

  resetPassword: (newPassword: string, email: string) => {
    return axiosInstance.post(INSTRUCTOR_RESET_PASSWORD_API, {
      newPassword,
      email,
    });
  },
  changePassword: (currentPassword: string, newPassword: string) => {
    return axiosInstance.post(INSTRUCTOR_CHANGE_PASSWORD_API, {
      currentPassword,
      newPassword,
    });
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
    const res = await axiosInstance.get(INSTRUCTOR_PROFILE_API);
    return res.data;
  },

  logout: async () => {
    try {
      await axiosInstance.post(INSTRUCTOR_LOGOUT_API);
      store.dispatch(clearStudent());
      localStorage.removeItem("InstructorToken");
      window.location.href = "/instructor/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
  resendOtp: async (email: string) => {
    return await axiosInstance.post(INSTRUCTOR_RESEND_OTP_API, { email });
  },
  updateProfile: async (data: Teacher) => {
    const formData = buildFormData(data);
    const res = await axiosInstance.put(INSTRUCTOR_PROFILE_API, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  getCourseById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/instructor/getCourse/${id}`);
      console.log(response);
      return response.data.data.course;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },
  createCourse: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post(
        INSTRUCTOR_CREATE_COURSE_API,
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
      const response = await axiosInstance.get(INSTRUCTOR_GET_ALL_COURSES_API);
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
    return await axiosInstance.get(INSTRUCTOR_GET_ALL_CHATS_API);
  },
  getMessages: async (chatId: string) => {
    return await axiosInstance.get(`/instructor/getMessages/${chatId}`);
  },
  postMessage: async (data: {
    chatId: string;
    text: string;
    sender: string;
  }) => {
    return await axiosInstance.post(INSTRUCTOR_POST_MESSAGE_API, data);
  },
  getAllCategories: () => {
    return axiosInstance.get(INSTRUCTOR_GET_ALL_CATEGORIES_API);
  },
  getAllLanguages: () => {
    return axiosInstance.get(INSTRUCTOR_GET_ALL_LANGUAGES_API);
  },
  getWallet: () => {
    return axiosInstance.get(INSTRUCTOR_WALLET_API);
  },
  getPaypalEmail: () => {
    return axiosInstance.get(INSTRUCTOR_PROFILE_API);
  },
  updatePaypalEmail: (email: string) => {
    return axiosInstance.patch(INSTRUCTOR_UPDATE_PAYPAL_EMAIL_API, {
      paypalEmail: email,
    });
  },
  requestPayout: (email: string) => {
    return axiosInstance.post(INSTRUCTOR_REQUEST_PAYOUT_API, {
      paypalEmail: email,
    });
  },
  getCallhistory: (instructorId: string) => {
    return axiosInstance.get(`/instructor/getCallhistory/${instructorId}`);
  },
  getDashboard: (params: any) => {
    return axiosInstance.get(INSTRUCTOR_DASHBOARD_API, { params });
  },
  createNotification: (data: any) => {
    return axiosInstance.post(INSTRUCTOR_CREATE_NOTIFICATION_API, data);
  },
  getNotifications: async () => {
    const res = await axiosInstance.get(INSTRUCTOR_GET_NOTIFICATIONS_API);
    return res.data;
  },
};

export default instructorAPI;
