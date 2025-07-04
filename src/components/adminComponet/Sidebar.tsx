import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "../ui/button";
import { useLocation, Link } from "react-router-dom";

const menuItems = [
  { label: "Dash Board", icon: "mdi:view-dashboard", path: "/admin/dashboard" },
  { label: "Students", icon: "mdi:account-group", path: "/admin/students" },
  { label: "Teachers", icon: "mdi:teach", path: "/admin/teachers" },
  { label: "Courses", icon: "mdi:book-open-variant", path: "/admin/courses" },
  { label: "Categories", icon: "mdi:shape-outline", path: "/admin/categories" },
  { label: "Languages", icon: "mdi:translate", path: "/admin/languages" },
  { label: "Plans", icon: "mdi:clipboard-list-outline", path: "/admin/plans" },
  { label: "Payout", icon: "mdi:cash-multiple", path: "/admin/payout" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white border border-indigo-200 rounded-xl m-4 p-4 flex flex-col justify-between shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-indigo-700 px-2">
          Admin Panel
        </h2>
        <ul className="space-y-2">
          {menuItems.map(({ label, icon, path }) => {
            const isActive = location.pathname === path;

            return (
              <li
                key={label}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-200 font-semibold text-indigo-900"
                    : "hover:bg-indigo-100 text-gray-800"
                }`}
              >
                <Icon icon={icon} className="text-xl text-indigo-600" />
                <Link to={path} className="flex-1">
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant="outline"
        className="mt-6 bg-red-50 hover:bg-red-100 text-red-600 border-none rounded-lg flex items-center gap-2"
      >
        <Icon icon="mdi:logout" className="text-lg" />
        Logout
      </Button>
    </aside>
  );
};

export default Sidebar;
