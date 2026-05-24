import logo from "../../../assets/img/logo.png";
import { NavLink } from "react-router-dom";
import useRole from "../../hooks/useRole";
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdBarChart,
  MdSettings,
  MdGroup,
  MdUpload,
  MdPin,
  MdMemory,
  MdKey,
} from "react-icons/md";

// ── Admin sees everything ──
const adminNavItems = [
  { id: 1, label: "Dashboard",  href: "/admin/dashboard",  icon: <MdDashboard /> },
  { id: 2, label: "Students",   href: "/admin/students",   icon: <MdSchool />    },
  { id: 3, label: "Results",    href: "/admin/results",    icon: <MdBarChart />  },
  { id: 4, label: "Teachers",   href: "/admin/teachers",   icon: <MdPeople />    },
  { id: 5, label: "Users",      href: "/admin/users",      icon: <MdGroup />     },
  { id: 6, label: "Add Yearbook Entry",      href: "/admin/addyearbookentry", icon: <MdMemory />     },
{ id: 7, label: "Generate PIN", href: "/admin/generatepin", icon: <MdKey /> },  
];

// ── Teacher sees limited menu ──
const teacherNavItems = [
  { id: 1, label: "Dashboard",      href: "/teacher/dashboard", icon: <MdDashboard /> },
  { id: 2, label: "Students",       href: "/teacher/students",  icon: <MdSchool />    },
  { id: 3, label: "Results",        href: "/teacher/results",   icon: <MdBarChart />  },
  { id: 4, label: "Upload Result",  href: "/teacher/upload",    icon: <MdUpload />    },
];

const Slidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const role     = useRole();
  const navItems = role === "teacher" ? teacherNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 mt-[3.5rem] left-0 z-50
          w-[240px] min-h-screen bg-white border-r border-gray-100
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-6 border-b border-gray-100">
          <div className="w-[10rem] h-[8rem] rounded-xl bg-[#a13ea1]/10 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="w-[20rem] h-[6rem] object-contain" />
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-3 pb-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
            ${role === "teacher"
              ? "bg-green-100 text-green-700"
              : "bg-[#a13ea1]/10 text-[#a13ea1]"}`}>
            {role === "teacher" ? "Teacher Portal" : "Admin Portal"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 px-2 pb-2">
            Main Menu
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-[#a13ea1] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#a13ea1] hover:bg-[#a13ea1]/10"
                }`
              }
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <span className="text-xs opacity-40">›</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Slidebar;