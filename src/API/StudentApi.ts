import { axiosInstance } from "./axiosInstance";
import { store } from "@/features/student/redux/store";
import { setAccessToken, clearStudent } from "@/features/student/redux/studentSlce";
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
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (formdata: object) => {
    return axiosInstance.post("/students/login", formdata);
  },
  googleLogin: ({ token, role }: { token: string; role: string }) => {
    return axiosInstance.post("/students/google-login", { token, role });
  },
  verifyOtp: (formData: object) => {
    return axiosInstance.post("/students/verify-otp", formData);
  },
  ForgotverifyOtp: (formData: object) => {
    return axiosInstance.post("/students/forgot-verify-otp", formData);
  },
  sendOtp: (email: string) => {
    return axiosInstance.post("/students/send-otp", { email });
  },
  resetPassword: (newPassword: string, email: string) => {
    return axiosInstance.post("/students/reset-password", { newPassword, email });
  },
  logout: async () => {
    try {
      await axiosInstance.post("/students/logout");
      store.dispatch(clearStudent());
      localStorage.removeItem("studentToken");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
  resendOtp: async (email: string) => {
    return await axiosInstance.post("/students/resend-otp", { email });
  },

  // ── Student Profile ───────────────────────────────────────────────────────
  getStudent: async () => {
    try {
      const response = await axiosInstance.get("/students");
      console.log(response);
      return response;
    } catch (error) {
      console.error("Fetching student failed:", error);
      throw error;
    }
  },
  getProfile: async () => {
    return await axiosInstance.get("/students/profile").then((res) => res.data);
  },
  updateProfile: async (data: ProfileData) => {
    try {
      console.log("Updating profile with data:", data);
      const response = await axiosInstance.put("/students/profile", data, {
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

  // ── Courses ───────────────────────────────────────────────────────────────
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

      const response = await axiosInstance.get("/courses", {
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
      const response = await axiosInstance.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Fetching course failed:", error);
      throw error;
    }
  },
  findCarriculam: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/courses/${id}/curriculum`);
      return response.data;
    } catch (error) {
      console.error("Fetching curriculum failed:", error);
      throw error;
    }
  },
  getAllProgress: async () => {
    return axiosInstance.get("/students/progress");
  },
  getProgress: async (studentId: string, courseId: string) => {
    return axiosInstance.get(`/students/${studentId}/courses/${courseId}/progress`);
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
    return axiosInstance.patch("/students/progress", {
      studentId,
      courseId,
      sectionId,
      lectureId,
      progress,
      totalSeconds,
      actualSecondsWatched,
    });
  },
  getEnrolledCourses: () => {
    return axiosInstance.get("/courses/enrolled");
  },
  findCoursByid: (id: string) => {
    return axiosInstance.get(`/courses/order/${id}`);
  },
  findFullCourse: (id: string) => {
    return axiosInstance.get(`/courses/full/${id}`);
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  createOrder: (cart: object) => {
    return axiosInstance.post("/students/orders", { cart });
  },
  captureOrder: (orderID: string) => {
    return axiosInstance.post(`/students/orders/${orderID}/capture`);
  },
  getPurchaseHistory: () => {
    return axiosInstance.get("/students/orders");
  },

  // ── Reviews ───────────────────────────────────────────────────────────────
  addReview: (
    courseId: string,
    reviewData: { rating: number; comment: string }
  ) => {
    return axiosInstance.post(`/courses/${courseId}/reviews`, reviewData);
  },
  getReviews: (courseId: string) => {
    return axiosInstance.get(`/courses/${courseId}/reviews`);
  },
  getMyReview: (courseId: string) => {
    return axiosInstance.get(`/courses/${courseId}/my-review`);
  },
  reactToReview: (reviewId: string, type: "like" | "dislike") => {
    return axiosInstance.patch(`/reviews/${reviewId}/reaction`, { type });
  },

  // ── Wishlist ──────────────────────────────────────────────────────────────
  addToWishlist: (courseId: string) => {
    return axiosInstance.post(`/courses/${courseId}/wishlist`);
  },
  removeFromWishlist: (courseId: string) => {
    return axiosInstance.delete(`/courses/${courseId}/wishlist`);
  },
  getWishlist: () => {
    return axiosInstance.get("/students/wishlist");
  },

  // ── Discussions ───────────────────────────────────────────────────────────
  getDiscussion: (id: string) => {
    return axiosInstance.get(`/discussions/${id}`);
  },
  createDiscussion: (id: string, payload: { text: string }) => {
    return axiosInstance.post(`/discussions/${id}`, payload);
  },
  reactHandle: (id: string, type: string) => {
    return axiosInstance.post(`/discussions/${id}/react`, { type: type });
  },
  addReply: (discussionId: string, data: { text: string }) => {
    return axiosInstance.post(`/discussions/${discussionId}/replies`, data);
  },
  getReplies: (discussionId: string) => {
    return axiosInstance.get(`/discussions/${discussionId}/replies`);
  },

  // ── Chat ──────────────────────────────────────────────────────────────────
  postChat: (chatData: { userId: string; instructorId: string }) => {
    return axiosInstance.post("/chats", chatData);
  },
  getChat: (userId: string) => {
    return axiosInstance.get(`/chats/user/${userId}`);
  },
  getMessage: (selectedChatId: string) => {
    return axiosInstance.get(`/chats/${selectedChatId}/messages`);
  },
  postMessage: (messageData: object) => {
    return axiosInstance.post("/chats/messages", messageData);
  },
  chatApi: (message: { message: string }, courseId: string) => {
    return axiosInstance.post(`/chats/${courseId}/ai`, message);
  },
  findAiChat: (courseId: string) => {
    return axiosInstance.get(`/chats/${courseId}/ai`);
  },

  // ── Notes ─────────────────────────────────────────────────────────────────
  getNotes: (courseId: string) => {
    return axiosInstance.get(`/notes/${courseId}`);
  },
  createNote: (noteData: {
    title: string;
    course_id: string;
    notes: string[];
  }) => {
    return axiosInstance.post("/notes", noteData);
  },
  updateNoteBookTitle: (notebookId: string, title: string) => {
    return axiosInstance.patch(`/notes/${notebookId}/title`, { title });
  },
  addNoteToNotebook: (id: string, note: string) => {
    return axiosInstance.put(`/notes/${id}`, { note });
  },
  deleteNotebook: async (notebookId: string) => {
    return await axiosInstance.delete(`/notes/${notebookId}`);
  },
  deleteNoteFromNotebook: async (notebookId: string, noteIndex: number) => {
    return await axiosInstance.patch(`/notes/${notebookId}/delete`, {
      noteIndex,
    });
  },
  updateNoteInNotebook: async (
    notebookId: string,
    noteIndex: number,
    newText: string
  ) => {
    return await axiosInstance.patch(`/notes/${notebookId}/update`, {
      noteIndex,
      newText,
    });
  },

  // ── Plans ─────────────────────────────────────────────────────────────────
  getPlans: async () => {
    return await axiosInstance.get("/plans");
  },
  getPlan: async () => {
    return await axiosInstance.get("/students/plans");
  },
  createPlanOrder: (data: { planId: string; userId: string }) =>
    axiosInstance.post("/plans/checkout", data),
  capturePlanOrder: (orderId: string) =>
    axiosInstance.post(`/plans/checkout/capture`, { orderId }),

  // ── Notifications ─────────────────────────────────────────────────────────
  sendNotification: async (notification: {
    studentId: string;
    instructorId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
  }) => {
    return await axiosInstance.post("/students/notifications", notification);
  },
  getNotifications: async () => {
    return await axiosInstance.get("/students/notifications");
  },
  markNotificationAsRead: async (notificationId: string) => {
    return await axiosInstance.patch(`/students/notifications/${notificationId}`);
  },

  // ── Legacy / unused (kept for backward compat, remove if not needed) ──────
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
  clearNotifications: async () => {
    return await axiosInstance.delete("/student/notifications");
  },
  checkout: (data: {
    userId: string;
    planId: string;
    paymentMethod: string;
    amount: number;
    currency: string;
  }) => axiosInstance.post("/plans/checkout", data),
  updateCheckout: (
    id: string,
    data: { paymentStatus: string; transactionId?: string }
  ) => axiosInstance.patch(`/plan/checkout/${id}`, data),
};

export default studentAPI;
