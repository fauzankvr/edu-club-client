import {axiosInstance} from "./axiosInstance";
import { store } from "@/features/student/redux/store";
import { setAccessToken,clearStudent } from "@/features/student/redux/studentSlce";
import { CourseQueryParams } from "@/Interface/CourseData";
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest._retry 
    ) {
      originalRequest._retry = false;
      try {
        const response = await axiosInstance.post("/refresh");
        const { accessToken } = response.data;
        store.dispatch(setAccessToken(accessToken));
        localStorage.setItem("studentToken", accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh failed:", refreshError);
        store.dispatch(clearStudent());
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
  googleLogin: ({ token, role }: { token: string; role: string }) => {
    return axiosInstance.post("/student/googleLogin", { token, role });
  },
  verifyOtp: (formData: object) => {
    return axiosInstance.post("/student/verifyotp", formData);
  },

  ForgotverifyOtp: (formData: object) => {
    return axiosInstance.post("/student/forgotVerifyOtp", formData);
  },
  sendOtp: (email: string) => {
    return axiosInstance.post("/student/sendOtp", { email });
  },
  resetPassword: (newPassword: string, email: string) => {
    return axiosInstance.post("/student/resetPassword", { newPassword, email });
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
  resendOtp: async (email: string) => {
    console.log(email);
    return await axiosInstance.post("/student/resendOtp", { email });
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

      // Flatten filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params[key] = value;
        });
      }

      const response = await axiosInstance.get("/student/getAllCourses", {
        params,
        withCredentials: true,
      });

      return response.data.data;
    } catch (error) {
      console.error("Error in getAllCourses:", error);
      throw error;
    }
  },
  findOneCourse: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/student/getCourse/${id}`);
      return response.data;
    } catch (error) {
      console.error("Fetching course failed:", error);
      throw error;
    }
  },
  findCarriculam: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/student/getCurriculum/${id}`);
      return response.data;
    } catch (error) {
      console.error("Fetching curriculum failed:", error);
      throw error;
    }
  },
  getAllProgress: async () => {
    return axiosInstance.get("/student/getAllProgress");
  },
  getProgress: async (studentId: string, courseId: string) => {
    return axiosInstance.get(`/student/getProgress/${studentId}/${courseId}`);
  },
  updateProgress: async (
    studentId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    progress: string,
    totalSeconds: number,
    actualSecondsWatched: number
  ) => {
    return axiosInstance.patch("/student/updateProgress", {
      studentId,
      courseId,
      sectionId,
      lectureId,
      progress,
      totalSeconds,
      actualSecondsWatched
    });
  },
  createOrder: (cart: object) => {
    return axiosInstance.post("/student/orders", { cart });
  },

  captureOrder: (orderID: string) => {
    return axiosInstance.post(`/student/orders/capture/${orderID}`);
  },
  getPurchaseHistory: () => {
    return axiosInstance.get("/student/orders");
  },
  findCoursByid: (id: string) => {
    return axiosInstance.get(`/student/order/success/${id}`);
  },
  findFullCourse: (id: string) => {
    return axiosInstance.get(`/student/course/fullcourse/${id}`);
  },
  addReview: (
    courseId: string,
    reviewData: { rating: number; comment: string }
  ) => {
    return axiosInstance.post(`/student/course/${courseId}/review`, reviewData);
  },

  getReviews: (courseId: string) => {
    return axiosInstance.get(`/student/course/${courseId}/reviews`);
  },
  getMyReview: (courseId: string) => {
    return axiosInstance.get(`/student/course/myReview/${courseId}`);
  },

  reactToReview: (reviewId: string, type: "like" | "dislike") => {
    return axiosInstance.patch(`/student/${reviewId}/reaction`, { type });
  },

  addToWishlist: (courseId: string) => {
    return axiosInstance.post(`/student/course/${courseId}/wishlist`);
  },
  removeFromWishlist: (courseId: string) => {
    return axiosInstance.delete(`/student/course/${courseId}/wishlist`);
  },
  getWishlist: () => {
    return axiosInstance.get("/student/course/wishlist");
  },
  getEnrolledCourses: () => {
    return axiosInstance.get("/student/courses/enrolled");
  },

  chatApi: (message: { message: string }, courseId: string) => {
    return axiosInstance.post(`/student/gemini/chat/${courseId}`, message);
  },
  findAiChat: (courseId: string) => {
    return axiosInstance.get(`/student/gemini/chat/${courseId}`);
  },
  getDiscussion: (id: string) => {
    return axiosInstance.get(`/student/discussion/${id}`);
  },
  createDiscussion: (id: string, payload: { text: string }) => {
    return axiosInstance.post(`/student/discussion/${id}`, payload);
  },
  reactHandle: (id: string, type: string) => {
    return axiosInstance.post(`/student/${id}/react`, { type: type });
  },
  addReply: (discussionId: string, data: { text: string }) => {
    return axiosInstance.post(
      `/student/discussion/${discussionId}/reply`,
      data
    );
  },
  getReplies: (discussionId: string) => {
    return axiosInstance.get(`/student/discussion/replay/${discussionId}`);
  },
  postChat: (chatData: { userId: string; instructorId: string }) => {
    return axiosInstance.post("/student/chat", chatData);
  },
  getChat: (userId: string) => {
    return axiosInstance.get(`/student/chat/user/${userId}`);
  },
  getMessage: (selectedChatId: string) => {
    return axiosInstance.get(`/chat/messages/${selectedChatId}`);
  },
  postMessage: (messageData: object) => {
    return axiosInstance.post("/chat/message", messageData);
  },
  getNotes: (courseId: string) => {
    return axiosInstance.get(`/student/notes/${courseId}`);
  },
  createNote: (noteData: {
    title: string;
    course_id: string;
    notes: string[];
  }) => {
    return axiosInstance.post("/student/notes", noteData);
  },
  updateNoteBookTitle: (notebookId: string, title: string) => {
    return axiosInstance.patch(`/student/noteTitle/${notebookId}`, { title });
  },
  addNoteToNotebook: (id: string, note: string) => {
    return axiosInstance.put(`/student/notes/${id}`, { note });
  },
  deleteNotebook: async (notebookId: string) => {
    return await axiosInstance.delete(`/student/notes/${notebookId}`);
  },
  deleteNoteFromNotebook: async (notebookId: string, noteIndex: number) => {
    return await axiosInstance.patch(`/student/note/${notebookId}/delete`, {
      noteIndex,
    });
  },
  updateNoteInNotebook: async (
    notebookId: string,
    noteIndex: number,
    newText: string
  ) => {
    return await axiosInstance.patch(`/student/note/${notebookId}/update`, {
      noteIndex,
      newText,
    });
  },
  getPlans: async () => {
    return await axiosInstance.get("/admin/plans");
  },
  getPlan: async () => {
    return await axiosInstance.get("/student/plan");
  },

  getNotifications: async () => {
    return await axiosInstance.get("/student/notifications");
  },
  markNotificationAsRead: async (notificationId: string) => {
    return await axiosInstance.patch(
      `/student/notifications/${notificationId}`
    );
  },
  clearNotifications: async () => {
    return await axiosInstance.delete("/student/notifications");
  },

  checkout: (data: {
    userId: string;
    planId: string;
    paymentMethod: string;
    amount: number;
    currency: string;
  }) => axiosInstance.post("/plan/checkout", data),
  updateCheckout: (
    id: string,
    data: { paymentStatus: string; transactionId?: string }
  ) => axiosInstance.patch(`/plan/checkout/${id}`, data),
  createPlanOrder: (data: { planId: string; userId: string }) =>
    axiosInstance.post("/plan/checkout", data),
  capturePlanOrder: (orderId: string) =>
    axiosInstance.post(`/plan/checkout/capture`, { orderId }),
};

export default studentAPI;
