import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/Middleware/protectedRoute";
import Dashboard from "@/Pages/admin/Dashboard";
import Login from "@/Pages/admin/Login";
import StudentManagemnt from "@/Pages/admin/StudentManagement";
import TeacherManagemnt from "@/Pages/admin/TeacherManagement";
import CategoryManagement from "@/Pages/admin/CategoryManagement";
import LanguageManagement from "@/Pages/admin/LanguageManagement";
import AdminPayouts from "@/Pages/admin/Payout";
import PlanManagement from "@/Pages/admin/PlanManagment";
import CourseManagement from "@/Pages/admin/CourseManagement";

const protectedRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "students", element: <StudentManagemnt /> },
  { path: "teachers", element: <TeacherManagemnt /> },
  { path: "categories", element: <CategoryManagement /> },
  { path: "languages", element: <LanguageManagement /> },
  { path: "courses", element: <CourseManagement /> },
  { path: "payout", element: <AdminPayouts /> },
  { path: "plans", element: <PlanManagement /> },
];

const AdiminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      {protectedRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute>{element}</ProtectedRoute>}
        />
      ))}
    </Routes>
  );
};

export default AdiminRoutes;
