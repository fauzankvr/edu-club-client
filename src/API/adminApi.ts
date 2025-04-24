import { axiosInstance } from "./axiosInstance";



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
    return axiosInstance.patch('/admin/blockStudent', { email })
  },
  findStudentDatas: () => {
    return axiosInstance.get("/admin/findAllStudent")
  },
  getAllTeachers: () => {
    return axiosInstance.get("/admin/findAllTeachers")
  },
  blockTeacher:(email: string)=> {
  return axiosInstance.patch("/admin/blockTeacher",{email})
  },
  logout: () => {
    return axiosInstance.post("/admin/logout")
  }
};

export default adminApi
