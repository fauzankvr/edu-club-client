import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

const Sidebar = () => {
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track window resize to toggle between mobile and desktop layouts
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const links = [
    {
      name: "Dashboard",
      path: "/Instructor/dashboard",
      icon: "mdi:view-dashboard",
    },
    {
      name: "Courses",
      path: "/Instructor/dashboard/courses",
      icon: "mdi:book-open-variant",
    },
    {
      name: "My Details",
      path: "/instructor/profile",
      icon: "mdi:account-details",
    },
    {
      name: "Video Calls",
      path: "/Instructor/dashboard/call-history",
      icon: "mdi:video",
    },
    // {
    //   name: "Live Class",
    //   path: "/Instructor/dashboard/video-call",
    //   icon: "mdi:video",
    // },
    {
      name: "Chats",
      path: "/Instructor/dashboard/chatlist",
      icon: "mdi:chat",
    },
    {
      name: "Wallet",
      path: "/Instructor/dashboard/wallet",
      icon: "mdi:wallet",
    },
  ];

  return (
    <div
      className={`${
        isMobile ? "w-26" : "w-60"
      } border-r p-4 space-y-2 transition-all duration-300`}
    >
      {!isMobile && <h2 className="text-sm mb-6">{pathname.slice(1)}</h2>}
      <div className="flex flex-col space-y-3">
        {links.map((link) => {
          const isActive = pathname === link.path;
          const commonClasses = `flex items-center ${
            isMobile ? "justify-center" : "justify-start"
          } py-2 px-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
            isActive ? "bg-indigo-300" : "hover:bg-indigo-100"
          }`;

          return  (
            <Link key={link.path} to={link.path} className={commonClasses}>
              <Icon
                icon={link.icon}
                className={`${isActive ? "text-indigo-700" : ""}`}
                width={24}
                height={24}
              />
              {!isMobile && <span className="ml-3">{link.name}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;

// link.name === "Live Class" ? (
//   <a
//     key={link.path}
//     href={link.path}
//     target="_blank"
//     rel="noopener noreferrer"
//     className={commonClasses}
//   >
//     <Icon
//       icon={link.icon}
//       className={`${isActive ? "text-indigo-700" : ""}`}
//       width={24}
//       height={24}
//     />
//     {!isMobile && <span className="ml-3">{link.name}</span>}
//   </a>
// ) :