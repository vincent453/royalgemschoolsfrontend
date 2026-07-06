import { useState, useEffect } from "react";
import logo from "../../../assets/img/logo.png";
import { NavLink, useLocation } from "react-router-dom";
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
  MdCheckCircle,
  MdAccountBalance,
  MdReceipt,
  MdBook,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";

// ─────────────────────────────────────────────────────────────
// Nav structure
// Items with group: true have children[] instead of href
// ─────────────────────────────────────────────────────────────

const adminNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <MdDashboard />,
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: <MdAccountBalance />,
    group: true,
    children: [
      { id: "acc-overview",  label: "Overview",       href: "/admin/accounting",          icon: <MdBarChart />  },
      { id: "acc-income",    label: "Income",          href: "/admin/accounting/income",   icon: <MdReceipt />   },
      { id: "acc-expenses",  label: "Expenses",        href: "/admin/accounting/expenses", icon: <MdReceipt />   },
      { id: "acc-ledger",    label: "Ledger",          href: "/admin/accounting/ledger",   icon: <MdBook />      },
      { id: "acc-fees",      label: "Fees & Billing",  href: "/admin/fees",                icon: <MdPin />       },
    ],
  },
  {
    id: "students",
    label: "Students",
    href: "/admin/students",
    icon: <MdSchool />,
  },
  {
    id: "results",
    label: "Results",
    icon: <MdBarChart />,
    group: true,
    children: [
      { id: "results-view",     label: "View Results",          href: "/admin/results",             icon: <MdBarChart />    },
      { id: "results-upload",   label: "Upload Subject Scores",  href: "/admin/uploadsubjectresult", icon: <MdUpload />      },
      { id: "results-finalize", label: "Finalize Results",       href: "/admin/finalizeresults",     icon: <MdCheckCircle /> },
    ],
  },
  {
    id: "people",
    label: "People",
    icon: <MdPeople />,
    group: true,
    children: [
      { id: "people-teachers", label: "Teachers", href: "/admin/teachers", icon: <MdPeople /> },
      { id: "people-users",    label: "Users",    href: "/admin/users",    icon: <MdGroup />  },
    ],
  },
  {
    id: "other",
    label: "Other",
    icon: <MdMemory />,
    group: true,
    children: [
      { id: "other-yearbook", label: "Yearbook Entry", href: "/admin/addyearbookentry", icon: <MdMemory /> },
      { id: "other-pin",      label: "Generate PIN",   href: "/admin/generatepin",      icon: <MdKey />    },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: <MdSettings />,
  },
];

// ── Subject teacher — can only upload scores ──
const subjectTeacherNavItems = [
  { id: "dashboard", label: "Dashboard",             href: "/teacher/dashboard",             icon: <MdDashboard /> },
  { id: "students",  label: "Students",              href: "/teacher/students",              icon: <MdSchool />    },
  { id: "upload",    label: "Upload Subject Scores",  href: "/teacher/upload-subject-result", icon: <MdUpload />   },
  { id: "results",   label: "Results",                href: "/teacher/results",               icon: <MdBarChart /> },
];

// ── Class teacher — can finalize results ──
const classTeacherNavItems = [
  { id: "dashboard", label: "Dashboard",        href: "/teacher/dashboard",       icon: <MdDashboard />  },
  { id: "students",  label: "Students",         href: "/teacher/students",        icon: <MdSchool />     },
  { id: "finalize",  label: "Finalize Results", href: "/teacher/finalize-result", icon: <MdCheckCircle />},
  { id: "results",   label: "Results",          href: "/teacher/results",         icon: <MdBarChart />   },
];

// ── General teacher — legacy / upload old flow ──
const teacherNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/teacher/dashboard",
    icon: <MdDashboard />,
  },
  {
    id: "students",
    label: "Students",
    href: "/teacher/students",
    icon: <MdSchool />,
  },
  {
    id: "results",
    label: "Results",
    icon: <MdBarChart />,
    group: true,
    children: [
      { id: "results-view",     label: "View Results",          href: "/teacher/results",               icon: <MdBarChart />    },
      { id: "results-upload",   label: "Upload Result",         href: "/teacher/upload",                icon: <MdUpload />      },
      { id: "results-subject",  label: "Upload Subject Scores", href: "/teacher/upload-subject-result", icon: <MdUpload />      },
      { id: "results-finalize", label: "Finalize Results",      href: "/teacher/finalize-result",       icon: <MdCheckCircle /> },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Role meta
// ─────────────────────────────────────────────────────────────
const roleLabel = {
  admin:           "Admin Portal",
  teacher:         "Teacher Portal",
  subject_teacher: "Subject Teacher",
  class_teacher:   "Class Teacher",
};

const roleBadgeColor = {
  admin:           "bg-[#a13ea1]/10 text-[#a13ea1]",
  teacher:         "bg-green-100 text-green-700",
  subject_teacher: "bg-blue-100 text-blue-700",
  class_teacher:   "bg-indigo-100 text-indigo-700",
};

// ─────────────────────────────────────────────────────────────
// GroupItem — collapsible nav group
// ─────────────────────────────────────────────────────────────
const GroupItem = ({ item, onClose }) => {
  const location = useLocation();
  const isGroupActive = item.children.some((c) => location.pathname === c.href);
  const [open, setOpen] = useState(isGroupActive);

  // Auto-open when navigating directly into a child route
  useEffect(() => {
    if (isGroupActive) setOpen(true);
  }, [location.pathname]);

  return (
    <div>
      {/* Group header */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 text-left
          ${isGroupActive
            ? "text-[#a13ea1] bg-[#a13ea1]/10"
            : "text-gray-500 hover:text-[#a13ea1] hover:bg-[#a13ea1]/10"
          }
        `}
      >
        <span className="w-5 text-center text-base flex-shrink-0">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        <span className="text-base opacity-50">
          {open ? <MdExpandLess /> : <MdExpandMore />}
        </span>
      </button>

      {/* Children */}
      {open && (
        <div className="ml-4 pl-3 border-l-2 border-[#a13ea1]/20 mt-1 space-y-0.5">
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-[#a13ea1] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#a13ea1] hover:bg-[#a13ea1]/10"
                }`
              }
            >
              <span className="w-4 text-center text-sm flex-shrink-0">{child.icon}</span>
              <span className="flex-1">{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
const Slidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const role = useRole();

  const navItems =
    role === "subject_teacher" ? subjectTeacherNavItems :
    role === "class_teacher"   ? classTeacherNavItems   :
    role === "teacher"         ? teacherNavItems        :
    adminNavItems;

  const handleClose = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={handleClose}
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
            ${roleBadgeColor[role] ?? roleBadgeColor.admin}`}>
            {roleLabel[role] ?? "Admin Portal"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 px-2 pb-2">
            Main Menu
          </p>

          {navItems.map((item) =>
            item.group ? (
              <GroupItem key={item.id} item={item} onClose={handleClose} />
            ) : (
              <NavLink
                key={item.id}
                to={item.href}
                onClick={handleClose}
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
            )
          )}
        </nav>
      </aside>
    </>
  );
};

export default Slidebar;