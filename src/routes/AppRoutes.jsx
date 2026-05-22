import { Routes, Route, Navigate } from "react-router-dom";

// Public pages
import Home       from "../public/pages/Home";
import About      from "../public/pages/About";
import Contact    from "../public/pages/Contact";
import Admissions from "../public/pages/Admission";
import Portal     from "../public/pages/Portal";
import Yearbook   from "../public/pages/YearBook";

// Shared login
import AdminLogin from "../admin/pages/AdminLogin";

// Admin pages
import AdminDashboard from "../admin/pages/AdminDashboard";
import Student        from "../admin/pages/Student";
import AddStudent     from "../admin/pages/AddStudent";
import AddTeachers    from "../admin/pages/AddTeachers";
import UploadResult   from "../admin/pages/UploadResult";
import Teacher        from "../admin/pages/Teacher";
import Result         from "../admin/pages/Results";
import EditStudent    from "../admin/pages/EditStudent";
import Settings       from "../admin/pages/Sethings";
import GeneratePin    from "../admin/pages/PinGenatration";
import Users          from "../admin/pages/Users";
import AddUser        from "../admin/pages/AddUsers";
import ResultCard     from "../admin/pages/ResultCard";

// Route guards
import { AdminRoute, TeacherRoute   } from "./ProtectedRoutes";
import AddYearbookEntry from "../admin/pages/AddYearBookEntry";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Public Routes ── */}
      <Route path="/"           element={<Home />}       />
      <Route path="/about"      element={<About />}      />
      <Route path="/contact"    element={<Contact />}    />
      <Route path="/admissions" element={<Admissions />} />
      <Route path="/portal"     element={<Portal />}     />
      <Route path="/yearbook"   element={<Yearbook />}   />

      {/* ── Shared Login ── */}
      <Route path="/admin/portal" element={<AdminLogin />} />

      {/* ── Admin-only Routes ── */}
      {/* Teachers hitting these get redirected to /teacher/dashboard */}
      <Route path="/admin/dashboard"         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/students"          element={<AdminRoute><Student /></AdminRoute>} />
      <Route path="/admin/students/add"      element={<AdminRoute><AddStudent /></AdminRoute>} />
      <Route path="/admin/students/edit/:id" element={<AdminRoute><EditStudent /></AdminRoute>} />
      <Route path="/admin/teachers"          element={<AdminRoute><Teacher /></AdminRoute>} />
      <Route path="/admin/teachers/add"      element={<AdminRoute><AddTeachers /></AdminRoute>} />
      <Route path="/admin/users"             element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/addUsers"          element={<AdminRoute><AddUser /></AdminRoute>} />
      <Route path="/admin/results"           element={<AdminRoute><Result /></AdminRoute>} />
      <Route path="/admin/upload"            element={<AdminRoute><UploadResult /></AdminRoute>} />
      <Route path="/admin/assyearbookentry"            element={<AdminRoute><AddYearbookEntry /></AdminRoute>} />
      <Route path="/admin/settings"          element={<AdminRoute><Settings /></AdminRoute>} />
      <Route path="/admin/generatepin"       element={<AdminRoute><GeneratePin /></AdminRoute>} />
      <Route path="/admin/results/view/:id"  element={<AdminRoute><ResultCard /></AdminRoute>} />

      {/* ── Teacher Routes ── */}
      {/* Admins hitting these get redirected to /admin/dashboard */}
      <Route path="/teacher/dashboard" element={<TeacherRoute><AdminDashboard /></TeacherRoute>} />
      <Route path="/teacher/students"  element={<TeacherRoute><Student /></TeacherRoute>} />
      <Route path="/teacher/results"   element={<TeacherRoute><Result /></TeacherRoute>} />
      <Route path="/teacher/upload"    element={<TeacherRoute><UploadResult /></TeacherRoute>} />
      <Route path="/teacher/results/view/:id" element={<TeacherRoute><ResultCard /></TeacherRoute>} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}