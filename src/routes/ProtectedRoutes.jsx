import { Navigate } from "react-router-dom";

// ── Helper: decode role from JWT ──
const getRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).role ?? null;
  } catch {
    return null;
  }
};

// ── ProtectedRoute: requires any valid token ──
// If no token → redirect to login
// If token exists → allow through (both admin and teacher)
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;
  return children;
};

// ── AdminRoute: admin only ──
// Teachers are redirected to their own dashboard
export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;

  const role = getRole();
  if (role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  return children;
};

// ── TeacherRoute: teacher only ──
// Admins are redirected to admin dashboard
export const TeacherRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin/portal" replace />;

  const role = getRole();
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// Default export kept for backward compatibility with existing imports
export default ProtectedRoute;