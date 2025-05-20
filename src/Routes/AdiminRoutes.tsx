import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/Middleware/protectedRoute";
import Dashboard from "@/Pages/admin/Dashboard";
import Login from "@/Pages/admin/Login";
import StudentManagemnt from "@/Pages/admin/StudentManagement";
import TeacherManagemnt from "@/Pages/admin/TeacherManagement";
import CategoryManagement from "@/Pages/admin/CategoryManagement";
import LanguageManagement from "@/Pages/admin/LanguageManagement";

const protectedRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "students", element: <StudentManagemnt /> },
  { path: "teachers", element: <TeacherManagemnt /> },
  { path: "categories", element: <CategoryManagement /> },
  { path: "languages", element: <LanguageManagement /> },
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
