export const tokenManager = {
  getToken(role: "student" | "instructor" | "admin") {
    if (role === "student") return localStorage.getItem("studentToken");
    if (role === "instructor") return localStorage.getItem("InstructorToken");
    if (role === "admin") return localStorage.getItem("accessTokenAdmin");
  },

  setToken(role: "student" | "instructor" | "admin", token: string) {
    if (role === "student") localStorage.setItem("studentToken", token);
    if (role === "instructor") localStorage.setItem("InstructorToken", token);
    if (role === "admin") localStorage.setItem("accessTokenAdmin", token);
  },

  clear(role: "student" | "instructor" | "admin") {
    if (role === "student") localStorage.removeItem("studentToken");
    if (role === "instructor") localStorage.removeItem("InstructorToken");
    if (role === "admin") localStorage.removeItem("accessTokenAdmin");
  },
};
