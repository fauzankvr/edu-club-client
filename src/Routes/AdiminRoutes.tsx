import ProtectedRoute from '@/Middleware/protectedRoute';
import Dashboard from '@/Pages/admin/Dashboard'
import Login from '@/Pages/admin/Login';
import StudentManagemnt from '@/Pages/admin/StudentManagement'
import TeacherManagemnt from '@/Pages/admin/TeacherManagement';
import { Route, Routes } from 'react-router-dom'

const AdiminRoutes = () => {
  return (
    <Routes>
      <Route path='login' element={<Login/>} />
      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route
        path="students"
        element={
          <ProtectedRoute>
            <StudentManagemnt />
          </ProtectedRoute>
        }
      />

      <Route
        path="teachers"
        element={
          <ProtectedRoute>
            <TeacherManagemnt />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AdiminRoutes