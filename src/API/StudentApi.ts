import {
  STUDENT_FORGOT_VERIFY_OTP_API,
  STUDENT_GOOGLE_LOGIN_API,
  STUDENT_LOGIN_API,
  STUDENT_LOGOUT_API,
  STUDENT_PROFILE_API,
  STUDENT_RESEND_OTP_API,
  STUDENT_RESET_PASSWORD_API,
  STUDENT_SEND_OTP_API,
  STUDENT_VERIFY_OTP_API,
  STUDENT_API,
  STUDENT_ALL_COURSES_API,
  STUDENT_PROGRESS_API,
  STUDENT_ORDER_API,
  STUDENT_WISHLIST_API,
  STUDENT_NOTES_API,
  STUDENT_NOTIFICATIONS_API,
  ADMIN_PLANS_API,
  STUDENT_PLAN_API,
  PLAN_CHECKOUT_API,
} from "@/constants/Api";

import { axiosInstance } from "./axiosInstance";
import { store } from "@/features/student/redux/store";
import { clearStudent } from "@/features/student/redux/studentSlce";
import { CourseQueryParams } from "@/Interface/CourseData";
import { ProfileData } from "@/Pages/types/student";
import { LOGIN_URL } from "@/constants/Urls";

const studentAPI = {
  login: (formdata: object) => axiosInstance.post(STUDENT_LOGIN_API, formdata),

  googleLogin: ({ token, role }: { token: string; role: string }) =>
    axiosInstance.post(STUDENT_GOOGLE_LOGIN_API, { token, role }),

  verifyOtp: (formData: object) =>
    axiosInstance.post(STUDENT_VERIFY_OTP_API, formData),

  ForgotverifyOtp: (formData: object) =>
    axiosInstance.post(STUDENT_FORGOT_VERIFY_OTP_API, formData),

  sendOtp: (email: string) =>
    axiosInstance.post(STUDENT_SEND_OTP_API, { email }),

  resetPassword: (newPassword: string, email: string) =>
    axiosInstance.post(STUDENT_RESET_PASSWORD_API, { newPassword, email }),

  fetchCourse: (
    query1?: string,
    query2?: string,
    price?: string,
    page?: number
  ) =>
    axiosInstance.get(
      `/student/get_course?search=${query1}&category=${query2}&price=${price}&page=${page}`
    ),

  getProfile: async () =>
    await axiosInstance.get(STUDENT_PROFILE_API).then((res) => res.data),

  logout: async () => {
    try {
      await axiosInstance.post(STUDENT_LOGOUT_API);
      store.dispatch(clearStudent());
      localStorage.removeItem("studentToken");
      window.location.href = LOGIN_URL;
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  resendOtp: async (email: string) =>
    await axiosInstance.post(STUDENT_RESEND_OTP_API, { email }),

  updateProfile: async (data: ProfileData) => {
    try {
      const response = await axiosInstance.put(STUDENT_PROFILE_API, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  },

  getStudent: async () => {
    try {
      const response = await axiosInstance.get(STUDENT_API);
      return response;
    } catch (error) {
      console.error("Fetching student failed:", error);
      throw error;
    }
  },

  getAllCourses: async (
    searchQuery?: string,
    page?: number,
    limit?: number,
    filters?: { [key: string]: string },
    sort?: string
  ) => {
    try {
      const params: CourseQueryParams = {
        search: searchQuery,
        page,
        limit,
        sort,
        ...filters,
      };

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params[key] = value;
        });
      }

      const response = await axiosInstance.get(STUDENT_ALL_COURSES_API, {
        params,
        withCredentials: true,
      });

      return response.data.data;
    } catch (error) {
      console.error("Error in getAllCourses:", error);
      throw error;
    }
  },

  findOneCourse: async (id: string) =>
    (await axiosInstance.get(`/student/getCourse/${id}`)).data,

  findCarriculam: async (id: string) =>
    (await axiosInstance.get(`/student/getCurriculum/${id}`)).data,

  getAllProgress: async () => axiosInstance.get(STUDENT_PROGRESS_API),

  getProgress: async (studentId: string, courseId: string) =>
    axiosInstance.get(`/student/progress/${studentId}/${courseId}`),

  updateProgress: async (
    studentId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    progress: string,
    totalSeconds: number,
    actualSecondsWatched: number
  ) =>
    axiosInstance.patch("/student/progress", {
      studentId,
      courseId,
      sectionId,
      lectureId,
      progress,
      totalSeconds,
      actualSecondsWatched,
    }),

  createOrder: (cart: object) =>
    axiosInstance.post(STUDENT_ORDER_API, { cart }),

  captureOrder: (orderID: string) =>
    axiosInstance.post(`/student/orders/capture/${orderID}`),

  getPurchaseHistory: () => axiosInstance.get(STUDENT_ORDER_API),

  findCoursByid: (id: string) =>
    axiosInstance.get(`/student/order/success/${id}`),

  findFullCourse: (id: string) =>
    axiosInstance.get(`/student/course/${id}`),

  addReview: (
    courseId: string,
    reviewData: { rating: number; comment: string }
  ) => axiosInstance.post(`/student/course/${courseId}/review`, reviewData),

  getReviews: (courseId: string) =>
    axiosInstance.get(`/student/course/${courseId}/reviews`),

  getMyReview: (courseId: string) =>
    axiosInstance.get(`/student/course/myReview/${courseId}`),

  reactToReview: (reviewId: string, type: "like" | "dislike") =>
    axiosInstance.patch(`/student/${reviewId}/reaction`, { type }),

  addToWishlist: (courseId: string) =>
    axiosInstance.post(`/student/course/${courseId}/wishlist`),

  removeFromWishlist: (courseId: string) =>
    axiosInstance.delete(`/student/course/${courseId}/wishlist`),

  getWishlist: () => axiosInstance.get(STUDENT_WISHLIST_API),

  getEnrolledCourses: () => axiosInstance.get("/student/courses/enrolled"),

  chatApi: (message: { message: string }, courseId: string) =>
    axiosInstance.post(`/student/gemini/chat/${courseId}`, message),

  findAiChat: (courseId: string) =>
    axiosInstance.get(`/student/gemini/chat/${courseId}`),

  getDiscussion: (id: string) => axiosInstance.get(`/student/discussion/${id}`),

  createDiscussion: (id: string, payload: { text: string }) =>
    axiosInstance.post(`/student/discussion/${id}`, payload),

  reactHandle: (id: string, type: string) =>
    axiosInstance.post(`/student/${id}/react`, { type }),

  addReply: (discussionId: string, data: { text: string }) =>
    axiosInstance.post(`/student/discussion/${discussionId}/reply`, data),

  getReplies: (discussionId: string) =>
    axiosInstance.get(`/student/discussion/replay/${discussionId}`),

  postChat: (chatData: { userId: string; instructorId: string }) =>
    axiosInstance.post("/student/chat", chatData),

  getChat: (userId: string) =>
    axiosInstance.get(`/student/chat/user/${userId}`),

  getMessage: (selectedChatId: string) =>
    axiosInstance.get(`/chat/messages/${selectedChatId}`),

  postMessage: (messageData: object) =>
    axiosInstance.post("/chat/message", messageData),

  getNotes: (courseId: string) =>
    axiosInstance.get(`${STUDENT_NOTES_API}/${courseId}`),

  createNote: (noteData: {
    title: string;
    courseId: string;
    notes: string[];
  }) => axiosInstance.post(STUDENT_NOTES_API, noteData),

  updateNoteBookTitle: (notebookId: string, title: string) =>
    axiosInstance.patch(`/student/noteTitle/${notebookId}`, { title }),

  addNoteToNotebook: (id: string, note: string) =>
    axiosInstance.put(`${STUDENT_NOTES_API}/${id}`, { note }),

  deleteNotebook: async (notebookId: string) =>
    await axiosInstance.delete(`${STUDENT_NOTES_API}/${notebookId}`),

  deleteNoteFromNotebook: async (notebookId: string, noteIndex: number) =>
    await axiosInstance.patch(`/student/note/${notebookId}/delete`, {
      noteIndex,
    }),

  updateNoteInNotebook: async (
    notebookId: string,
    noteIndex: number,
    newText: string
  ) =>
    await axiosInstance.patch(`/student/note/${notebookId}/update`, {
      noteIndex,
      newText,
    }),

  getPlans: async () => await axiosInstance.get(ADMIN_PLANS_API),

  getPlan: async () => await axiosInstance.get(STUDENT_PLAN_API),

  sendNotification: async (notification: {
    studentId: string;
    instructorId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
  }) => await axiosInstance.post(STUDENT_NOTIFICATIONS_API, notification),

  getNotifications: async () =>
    await axiosInstance.get(STUDENT_NOTIFICATIONS_API),

  markNotificationAsRead: async (notificationId: string) =>
    await axiosInstance.patch(`${STUDENT_NOTIFICATIONS_API}/${notificationId}`),

  clearNotifications: async () =>
    await axiosInstance.delete(STUDENT_NOTIFICATIONS_API),

  checkout: (data: {
    userId: string;
    planId: string;
    paymentMethod: string;
    amount: number;
    currency: string;
  }) => axiosInstance.post(PLAN_CHECKOUT_API, data),

  updateCheckout: (
    id: string,
    data: { paymentStatus: string; transactionId?: string }
  ) => axiosInstance.patch(`${PLAN_CHECKOUT_API}/${id}`, data),

  createPlanOrder: (data: { planId: string; userId: string }) =>
    axiosInstance.post(PLAN_CHECKOUT_API, data),

  capturePlanOrder: (orderId: string) =>
    axiosInstance.post(`${PLAN_CHECKOUT_API}/capture`, { orderId }),
};

export default studentAPI;
