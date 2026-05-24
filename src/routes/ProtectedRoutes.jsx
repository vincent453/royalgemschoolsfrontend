import { Navigate } from "react-router-dom";

const getRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])).role ?? null; }
  catch { return null; }
};

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
  if (getRole() === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  return children;
};

// ── Teacher only — admins get redirected ──
export const TeacherRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;
  if (getRole() === "admin") return <Navigate to="/admin/dashboard" replace />;
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