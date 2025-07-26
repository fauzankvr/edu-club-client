import { Plan } from "@/Pages/admin/PlanManagment";
import { axiosInstance } from "./axiosInstance";
import { DashboardParams, ReportParams } from "@/Pages/admin/Dashboard";

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith("/admin")) {
      const accessToken = localStorage.getItem("accessTokenAdmin");
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
        error.response.data?.message ==="Unauthorized: No token provided"&&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axiosInstance.post("/refresh");
        const { accessToken } = response.data;

        // Save new token
        localStorage.setItem("accessTokenAdmin", accessToken);
        // store.dispatch(setAccessToke(accessToken));

        // Set token on future requests
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // store.dispatch(clearStudent());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


const adminApi = {
  login: (formdata: object) => {
    return axiosInstance.post("/admin/login", formdata);
  },
  blockStudent: (email: string) => {
    return axiosInstance.patch("/admin/blockStudent", { email });
  },
  findStudentDatas: () => {
    return axiosInstance.get("/admin/findAllStudent");
  },
  getAllTeachers: () => {
    return axiosInstance.get("/admin/findAllTeachers");
  },
  blockTeacher: (email: string) => {
    return axiosInstance.patch("/admin/blockTeacher", { email });
  },
  approveTeacher: (email: string) => axiosInstance.patch('/admin/teachers/approve', { email }),
  logout: () => {
    return axiosInstance.post("/admin/logout");
  },

  getAllCategories: () => {
    return axiosInstance.get("/admin/category/getAll");
  },
  addCategory: (data: { name: string }) => {
    return axiosInstance.post("/admin/category/add", data);
  },
  toggleCategoryStatus: (id: string) => {
    return axiosInstance.patch(`/admin/category/toggleBlock/${id}`);
  },
  updateCategory: (id: string, data: { name: string }) => {
    return axiosInstance.patch(`/admin/category/update/${id}`, data);
  },
  getAllLanguages: () => {
    return axiosInstance.get("/admin/language/getAll");
  },
  addLanguage: (data: { name: string }) => {
    return axiosInstance.post("/admin/language/add", data);
  },
  updateLanguage: (id: string, data: { name: string }) => {
    return axiosInstance.patch(`/admin/language/update/${id}`, data);
  },
  toggleLanguageStatus: (id: string) => {
    return axiosInstance.patch(`/admin/language/toggleBlock/${id}`);
  },
  getPayoutRequests: () => {
    return axiosInstance.get("/admin/payouts");
  },
  approvePayout: (requestId: string, action: "APPROVE" | "REJECT") => {
    return axiosInstance.post(`/admin/payout/${requestId}`, { action });
  },
  getAllPlans: () => axiosInstance.get("/admin/plans"),
  addPlan: (plan: Plan) => axiosInstance.post("/admin/plans", plan),
  updatePlan: (id: string, plan: Plan) =>
    axiosInstance.put(`/admin/plans/${id}`, plan),
  togglePlanStatus: (id: string) =>
    axiosInstance.patch(`/admin/plans/${id}/toggle`),
  findPlan: (id: string) => axiosInstance.get(`/admin/plan/${id}`),
  getDashboard: (params: DashboardParams) =>
    axiosInstance.get("/admin/dashboard", { params }),
  getReport: (params: ReportParams) =>
    axiosInstance.get("/admin/report", { params, responseType: "blob" }),

  findCourseDatas: () => {
    return axiosInstance.get("/admin/courses");
  },
  blockCourse: (courseId: string) => {
    return axiosInstance.patch(`/admin/course/${courseId}/block`);
  },
};

export default adminApi;
