// Sidebar.js
import { Link, useLocation } from "react-router-dom";

const CoureseSideBar = () => {
  const { pathname } = useLocation();

  const links = [
    { name: "Landing Page", path: "/Instructor/dashboard/courses/landingpage" },
    { name: "Carriculam", path: "/Instructor/dashboard/courses/carriculam" },
    { name: "Go Back", path: "Instructor/home" },
  ];

  return (
    <div className="w-full md:w-60 border-r p-4 space-y-2">
      {/* <h2 className="text-sm mb-6">{pathname.slice(1)}</h2> */}
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`block text-center py-2 px-4 rounded-xl ${
            pathname === link.path ? "bg-indigo-300" : "hover:bg-indigo-100"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default CoureseSideBar;