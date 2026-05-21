import { navItems } from "../../context/data/mockdata";
import logo from "../../../assets/img/logo.png";
import { NavLink } from "react-router-dom";

const Slidebar = ({ sidebarOpen, setSidebarOpen }) => {
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
          fixed md:static top-0 left-0 z-50
          w-[240px] min-h-screen bg-white border-r border-gray-100
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-xl bg-[#a13ea1]/10 flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
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
                ${
                  isActive
                    ? "bg-[#a13ea1] text-white shadow-sm"
                    : "text-gray-500 hover:text-[#a13ea1] hover:bg-[#a13ea1]/10"
                }`
              }
            >
              <span className="w-5 text-center text-base">
                {item.icon}
              </span>

              <span className="flex-1">
                {item.label}
              </span>

              <span className="text-xs opacity-40">
                ›
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Slidebar;