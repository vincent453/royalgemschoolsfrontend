import { Navigate } from "react-router-dom";

const getRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])).role ?? null; }
  catch { return null; }
};

const getRoleHome = (role) => ({
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  subject_teacher: "/teacher/dashboard",
  class_teacher: "/teacher/dashboard",
  accountant: "/accountant",
  inventory_manager: "/inventory",
}[role] || "/admin/portal");

const getPortalRole = () => {
  const token = localStorage.getItem("portalToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.studentId ? localStorage.getItem("portalRole") : null;
  } catch { return null; }
};

// ── Any valid staff token ──
export const ProtectedRoute = ({ children }) => {
  if (!localStorage.getItem("token")) return <Navigate to="/admin/portal" replace />;
  return children;
};

// ── Admin only — teachers get redirected ──
export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;
  if (getRole() !== "admin") return <Navigate to={getRoleHome(getRole())} replace />;
  return children;
};

// ── Teacher only — admins get redirected ──
export const TeacherRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;
  if (!["teacher", "subject_teacher", "class_teacher"].includes(getRole())) {
    return <Navigate to={getRoleHome(getRole())} replace />;
  }
  return children;
};

export const AccountantRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;
  if (getRole() !== "accountant") return <Navigate to={getRoleHome(getRole())} replace />;
  return children;
};

export const FinanceRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;
  if (!["admin", "accountant"].includes(getRole())) return <Navigate to={getRoleHome(getRole())} replace />;
  return children;
};

export const InventoryRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;
  if (!["admin", "inventory_manager"].includes(getRole())) return <Navigate to={getRoleHome(getRole())} replace />;
  return children;
};

export const InventoryManagerRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;
  if (getRole() !== "inventory_manager") return <Navigate to={getRoleHome(getRole())} replace />;
  return children;
};

// ── Student portal ──
export const StudentPortalRoute = ({ children }) => {
  const role = getPortalRole();
  if (!role) return <Navigate to="/portal" replace />;
  if (role !== "student") return <Navigate to="/parent/dashboard" replace />;
  return children;
};

// ── Parent portal ──
export const ParentPortalRoute = ({ children }) => {
  const role = getPortalRole();
  if (!role) return <Navigate to="/portal" replace />;
  if (role !== "parent") return <Navigate to="/student/dashboard" replace />;
  return children;
};

export default ProtectedRoute;