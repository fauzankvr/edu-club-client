import { Plan } from "@/Pages/admin/PlanManagment";
import { axiosInstance } from "./axiosInstance";
import { DashboardParams, ReportParams } from "@/Pages/admin/Dashboard";
import {
  ADMIN_LOGIN_API,
  ADMIN_LOGOUT_API,
  ADMIN_BLOCK_STUDENT_API,
  ADMIN_FIND_ALL_STUDENTS_API,
  ADMIN_GET_ALL_TEACHERS_API,
  ADMIN_BLOCK_TEACHER_API,
  ADMIN_APPROVE_TEACHER_API,
  ADMIN_CATEGORY_GET_ALL_API,
  ADMIN_CATEGORY_ADD_API,
  ADMIN_CATEGORY_TOGGLE_API,
  ADMIN_CATEGORY_UPDATE_API,
  ADMIN_LANGUAGE_GET_ALL_API,
  ADMIN_LANGUAGE_ADD_API,
  ADMIN_LANGUAGE_UPDATE_API,
  ADMIN_LANGUAGE_TOGGLE_API,
  ADMIN_PAYOUTS_API,
  ADMIN_PAYOUT_API,
  ADMIN_PLANS_API,
  ADMIN_PLAN_API,
  ADMIN_DASHBOARD_API,
  ADMIN_REPORT_API,
  ADMIN_COURSES_API,
  ADMIN_BLOCK_COURSE_API,
} from "@/constants/adminApi";

const adminApi = {
  login: (formdata: object) => {
    return axiosInstance.post(ADMIN_LOGIN_API, formdata);
  },
  blockStudent: (email: string) => {
    return axiosInstance.patch(ADMIN_BLOCK_STUDENT_API, { email });
  },
  findStudentDatas: (limit: number, page: number) => {
    return axiosInstance.get(
      `${ADMIN_FIND_ALL_STUDENTS_API}?limit=${limit}&page=${page}`
    );
  },
  getAllTeachers: (limit: number, page: number) => {
    return axiosInstance.get(
      `${ADMIN_GET_ALL_TEACHERS_API}?limit=${limit}&page=${page}`
    );
  },
  blockTeacher: (email: string) => {
    return axiosInstance.patch(ADMIN_BLOCK_TEACHER_API, { email });
  },
  approveTeacher: (email: string) =>
    axiosInstance.patch(ADMIN_APPROVE_TEACHER_API, { email }),

  logout: () => {
    return axiosInstance.post(ADMIN_LOGOUT_API);
  },

  getAllCategories: (page: number, limit: number) => {
    return axiosInstance.get(
      `${ADMIN_CATEGORY_GET_ALL_API}?page=${page}&limit=${limit}`
    );
  },
  addCategory: (data: { name: string }) => {
    return axiosInstance.post(ADMIN_CATEGORY_ADD_API, data);
  },
  toggleCategoryStatus: (id: string) => {
    return axiosInstance.patch(`${ADMIN_CATEGORY_TOGGLE_API}/${id}`);
  },
  updateCategory: (id: string, data: { name: string }) => {
    return axiosInstance.patch(`${ADMIN_CATEGORY_UPDATE_API}/${id}`, data);
  },

  getAllLanguages: (limit: number, page: number) => {
    return axiosInstance.get(
      `${ADMIN_LANGUAGE_GET_ALL_API}?limit=${limit}&page=${page}`
    );
  },
  addLanguage: (data: { name: string }) => {
    return axiosInstance.post(ADMIN_LANGUAGE_ADD_API, data);
  },
  updateLanguage: (id: string, data: { name: string }) => {
    return axiosInstance.patch(`${ADMIN_LANGUAGE_UPDATE_API}/${id}`, data);
  },
  toggleLanguageStatus: (id: string) => {
    return axiosInstance.patch(`${ADMIN_LANGUAGE_TOGGLE_API}/${id}`);
  },

  getPayoutRequests: () => {
    return axiosInstance.get(ADMIN_PAYOUTS_API);
  },
  approvePayout: (requestId: string, action: "APPROVE" | "REJECT") => {
    return axiosInstance.post(`${ADMIN_PAYOUT_API}/${requestId}`, { action });
  },

  getAllPlans: (limit: number, page: number) =>
    axiosInstance.get(`${ADMIN_PLANS_API}?limit=${limit}&page=${page}`),
  addPlan: (plan: Plan) => axiosInstance.post(ADMIN_PLANS_API, plan),
  updatePlan: (id: string, plan: Plan) =>
    axiosInstance.put(`${ADMIN_PLANS_API}/${id}`, plan),
  togglePlanStatus: (id: string) =>
    axiosInstance.patch(`${ADMIN_PLANS_API}/${id}/toggle`),
  findPlan: (id: string) => axiosInstance.get(`${ADMIN_PLAN_API}/${id}`),

  getDashboard: (params: DashboardParams) =>
    axiosInstance.get(ADMIN_DASHBOARD_API, { params }),
  getReport: (params: ReportParams) =>
    axiosInstance.get(ADMIN_REPORT_API, { params, responseType: "blob" }),

  findCourseDatas: (page: number, limit: number) => {
    return axiosInstance.get(
      `${ADMIN_COURSES_API}?page=${page}&limit=${limit}`
    );
  },
  blockCourse: (courseId: string) => {
    return axiosInstance.patch(`${ADMIN_BLOCK_COURSE_API}/${courseId}/block`);
  },
};

export default adminApi;
