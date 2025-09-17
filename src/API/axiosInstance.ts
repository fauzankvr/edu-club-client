import axios from "axios";
import { tokenManager } from "./tokenManager";
const baseURL = import.meta.env.VITE_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    let role: "student" | "instructor" | "admin" | null = null;

    if (config.url?.startsWith("/student")) role = "student";
    if (config.url?.startsWith("/instructor")) role = "instructor";
    if (config.url?.startsWith("/admin")) role = "admin";

    if (role) {
      const accessToken = tokenManager.getToken(role);
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      // save role on request so response interceptor knows who to refresh
      (config as any)._role = role;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;
    console.log(error.response);
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest._role &&
      error.response.data.message == "Unauthorized"
    ) {
      originalRequest._retry = true;
      const role = originalRequest._role;

      try {
        const res = await axiosInstance.post(`/${role}/refresh`);
        const { accessToken } = res.data;

        tokenManager.setToken(role, accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        tokenManager.clear(role);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
