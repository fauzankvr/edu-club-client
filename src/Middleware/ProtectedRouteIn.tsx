import instructorAPI from "@/API/InstructorApi";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await instructorAPI.getProfile();
        setUser(response.profile); // adjust this line to match your response shape
      } catch (error) {
        console.error("Error fetching profile:", error);
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
    return <Navigate to="/instructor/login" />;
  }

  if (user.IsBlocked) {
      return <Navigate to="/instructor/login" />;
    //   <div className="flex flex-col items-center justify-center h-screen text-center">
    //     <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
    //     <p className="text-gray-500">Your account has been blocked.</p>
        //   </div>
    
  }
  return <Outlet />;
};

export default ProtectedRoute;
