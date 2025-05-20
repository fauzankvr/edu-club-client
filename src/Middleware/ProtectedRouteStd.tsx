import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import studentAPI from "@/API/StudentApi";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await studentAPI.getProfile();
        setUser(response); // adjust according to your API response shape
      } catch (error:any) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Checking access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-500">Your account has been blocked.</p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
