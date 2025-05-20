import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; 
import studentAPI from "@/API/StudentApi";
import { NavLink } from "react-router-dom";

// import { useSelector } from "react-redux";
// import { RootState } from "@/features/student/redux/store";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()
  const token = localStorage.getItem("studentToken");

  const handleProfile = async () => {
    // try {
    //   const response = await studentAPI.getStudent(); 
    //   const student = response.data;

    //   if (student.isBlocked) {
    //     alert("You are blocked. Access to profile is restricted.");
    //   } else {
    //     navigate("/profile");
    //   }
    // } catch (error) {
    //   console.log("Error fetching student data", error);
    // }
    navigate("/profile");
  };
  const handleWishlist = async () => {
  navigate("/wishlist")
}
  const handileLogout = async() => {
    try {
      console.log('logout')
       await studentAPI.logout()
    }catch(error){
      console.log(error);
    }
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            src="/logos/educlub_logo_nav.png"
            alt="EduClub Logo"
            className="w-36"
          />
        </a>

        {/* Navbar links (Hidden on small screens) */}
        <div className="hidden md:flex gap-16 text-lg font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "relative text-indigo-600 after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-indigo-600"
                : "hover:text-indigo-600"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/courses"
            className={({ isActive }) =>
              isActive
                ? "relative text-indigo-600 after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-indigo-600"
                : "hover:text-indigo-600"
            }
          >
            Courses
          </NavLink>
          <NavLink
            to="/mylearning"
            className={({ isActive }) =>
              isActive
                ? "relative text-indigo-600 after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-indigo-600"
                : "hover:text-indigo-600"
            }
          >
            My Learning
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "relative text-indigo-600 after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-indigo-600"
                : "hover:text-indigo-600"
            }
          >
            About
          </NavLink>
        </div>

        {/* Buttons (Hidden on small screens) */}
        {!token ? (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 border rounded-md text-indigo-600 border-indigo-600 hover:bg-indigo-600 hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Wishlist Button */}
            <button
              onClick={() => handleWishlist()} // 👉 You can define this function
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <Icon
                icon="mdi:heart-outline"
                className="w-7 h-7 text-pink-500"
              />
            </button>

            {/* Profile Button */}
            <button
              onClick={() => handleProfile()}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <Icon icon="mdi:account" className="w-7 h-7 text-indigo-600" />
            </button>

            {/* Logout Button */}
            <Button variant="outline" onClick={handileLogout}>
              Logout
            </Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <Icon
            icon={isOpen ? "tabler:x" : "tabler:menu-2"}
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center gap-3 py-4 border-t">
          <a href="#" className="hover:text-blue-600">
            Home
          </a>
          <a href="#" className="hover:text-blue-600">
            Courses
          </a>
          <a href="#" className="hover:text-blue-600">
            My Learning
          </a>
          <a href="#" className="hover:text-blue-600">
            About
          </a>
          <button className="w-sm px-4 py-2 border rounded-md text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition">
            Login
          </button>
          <button className="w-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
