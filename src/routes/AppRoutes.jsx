import { Routes, Route, Navigate } from "react-router-dom";

// Public
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

// Student / Parent dashboards
import StudentDashboard from "../admin/pages/StudentDashboard";
import ParentDashboard  from "../admin/pages/ParentDashboard";
import AddYearbookEntry from "../admin/pages/AddYearBookEntry";

// Guards
import {
  AdminRoute,
  TeacherRoute,
  StudentPortalRoute,
  ParentPortalRoute,
} from "./ProtectedRoutes";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Public ── */}
      <Route path="/"           element={<Home />}       />
      <Route path="/about"      element={<About />}      />
      <Route path="/contact"    element={<Contact />}    />
      <Route path="/admissions" element={<Admissions />} />
      <Route path="/yearbook"   element={<Yearbook />}   />

      {/* ── Portal login (student + parent) ── */}
      <Route path="/portal" element={<Portal />} />

      {/* ── Student dashboard ── */}
      <Route path="/student/dashboard"
        element={<StudentPortalRoute><StudentDashboard /></StudentPortalRoute>} />

      {/* ── Parent dashboard ── */}
      <Route path="/parent/dashboard"
        element={<ParentPortalRoute><ParentDashboard /></ParentPortalRoute>} />

      {/* ── Shared result card for portal users ── */}
      <Route path="/portal/results/:id" element={<ResultCard />} />

      {/* ── Staff login ── */}
      <Route path="/admin/portal" element={<AdminLogin />} />

      {/* ── Admin only ── */}
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
      <Route path="/admin/addyearbookentry"  element={<AdminRoute><AddYearbookEntry /></AdminRoute>} />
      <Route path="/admin/settings"          element={<AdminRoute><Settings /></AdminRoute>} />
      <Route path="/admin/generatepin"       element={<AdminRoute><GeneratePin /></AdminRoute>} />
      <Route path="/admin/results/view/:id"  element={<AdminRoute><ResultCard /></AdminRoute>} />

      {/* ── Teacher ── */}
      <Route path="/teacher/dashboard"       element={<TeacherRoute><AdminDashboard /></TeacherRoute>} />
      <Route path="/teacher/students"        element={<TeacherRoute><Student /></TeacherRoute>} />
      <Route path="/teacher/results"         element={<TeacherRoute><Result /></TeacherRoute>} />
      <Route path="/teacher/upload"          element={<TeacherRoute><UploadResult /></TeacherRoute>} />
      <Route path="/teacher/results/view/:id" element={<TeacherRoute><ResultCard /></TeacherRoute>} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}