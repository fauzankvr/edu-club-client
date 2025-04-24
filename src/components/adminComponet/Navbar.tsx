import adminApi from "@/API/adminApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate()
const handleLogout = async () => {
  try {
    console.log("logout");
    await adminApi.logout();
    localStorage.removeItem("accessTokenAdmin");
    navigate("/admin/login")
  } catch (error) {
    console.log(error);
  }
};
  return (
    <nav className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <a href="/admin/dashboard" className="flex items-center gap-2">
          <img
            src="/logos/educlub_logo_nav.png"
            alt="EduClub Logo"
            className="w-36"
          />
        </a>

        {/* Right Side */}
        <div className="relative flex items-center gap-3 cursor-pointer">
          <div
            className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            A
          </div>
          <span
            className="text-gray-800 font-medium"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Admin
          </span>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {/* <a
                href="/admin/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </a> */}
              <a
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
