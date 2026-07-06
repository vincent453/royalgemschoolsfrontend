import { Routes, Route, Navigate } from "react-router-dom";

// Public
import Home       from "../public/pages/Home";
import About      from "../public/pages/About";
import Contact    from "../public/pages/Contact";
import Admissions from "../public/pages/Admission";
import Portal     from "../public/pages/Portal";
import Yearbook   from "../public/pages/YearBook";
import Blog       from "../public/pages/Blog";

// Shared login
import AdminLogin from "../admin/pages/AdminLogin";

// Admin pages
import AdminDashboard      from "../admin/pages/AdminDashboard";
import Student             from "../admin/pages/Student";
import AddStudent          from "../admin/pages/AddStudent";
import AddTeachers         from "../admin/pages/AddTeachers";
import UploadResult        from "../admin/pages/UploadResult";
import Teacher             from "../admin/pages/Teacher";
import Result              from "../admin/pages/Results";
import EditStudent         from "../admin/pages/EditStudent";
import Settings            from "../admin/pages/Sethings";
import GeneratePin         from "../admin/pages/PinGenatration";
import Users               from "../admin/pages/Users";
import AddUser             from "../admin/pages/AddUsers";
import ResultCard          from "../admin/pages/ResultCard";
import UploadSubjectResult from "../admin/pages/UploadSubjectResult";
import FinalizeResult      from "../admin/pages/FinalizeResult";
import AddYearbookEntry    from "../admin/pages/AddYearBookEntry";

// Teacher dashboard
import TeacherDashboard from "../admin/pages/TeacherDashboard";

// Accounting
import AccountingDashboard from "../pages/accounting/Dashboard";
import Income from "../pages/accounting/Income";
import Expenses from "../pages/accounting/Expenses";
import Ledger from "../pages/accounting/Ledger";
import Receipts from "../pages/accounting/Receipts";

// Fees & Billing
import Fees from "../admin/pages/Fees";
import StudentFees from "../admin/pages/StudentFees";
import CollectPayment from "../admin/pages/CollectPayment";
import PaymentHistory from "../admin/pages/PaymentHistory";
import OutstandingBalances from "../admin/pages/OutstandingBalances";
import ReceiptDetails from "../admin/pages/ReceiptDetails";

// Student / Parent dashboards
import StudentDashboard from "../admin/pages/StudentDashboard";
import ParentDashboard  from "../admin/pages/ParentDashboard";

// Attendance
import AttendanceDashboard from "../admin/pages/AttendanceDashboard";
import MarkAttendance from "../admin/pages/MarkAttendance";
import AttendanceReport from "../admin/pages/AttendanceReport";
import StudentAttendanceHistory from "../admin/pages/StudentAttendanceHistory";
import StudentAttendancePortal from "../admin/pages/StudentAttendancePortal";

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
      <Route path="/blog"       element={<Blog />}       />

      {/* ── Portal login (student + parent) ── */}
      <Route path="/portal" element={<Portal />} />

      {/* ── Student portal ── */}
      <Route path="/student/dashboard"
        element={<StudentPortalRoute><StudentDashboard /></StudentPortalRoute>} />

      {/* ── Parent portal ── */}
      <Route path="/parent/dashboard"
        element={<ParentPortalRoute><ParentDashboard /></ParentPortalRoute>} />

      {/* ── Shared result card (portal + admin + teacher) ── */}
      <Route path="/portal/results/:id"       element={<ResultCard />} />

      {/* ── Staff login ── */}
      <Route path="/admin/portal" element={<AdminLogin />} />

      {/* ── Admin only ── */}
      <Route path="/admin/dashboard"
        element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/students"
        element={<AdminRoute><Student /></AdminRoute>} />
      <Route path="/admin/students/add"
        element={<AdminRoute><AddStudent /></AdminRoute>} />
      <Route path="/admin/students/edit/:id"
        element={<AdminRoute><EditStudent /></AdminRoute>} />
      <Route path="/admin/teachers"
        element={<AdminRoute><Teacher /></AdminRoute>} />
      <Route path="/admin/teachers/add"
        element={<AdminRoute><AddTeachers /></AdminRoute>} />
      <Route path="/admin/users"
        element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/addUsers"
        element={<AdminRoute><AddUser /></AdminRoute>} />
      <Route path="/admin/results"
        element={<AdminRoute><Result /></AdminRoute>} />
      <Route path="/admin/results/view/:id"
        element={<AdminRoute><ResultCard /></AdminRoute>} />
      <Route path="/admin/upload"
        element={<AdminRoute><UploadResult /></AdminRoute>} />
      <Route path="/admin/uploadsubjectresult"
        element={<AdminRoute><UploadSubjectResult /></AdminRoute>} />
      <Route path="/admin/finalizeresults"
        element={<AdminRoute><FinalizeResult /></AdminRoute>} />
      <Route path="/admin/generatepin"
        element={<AdminRoute><GeneratePin /></AdminRoute>} />
      <Route path="/admin/addyearbookentry"
        element={<AdminRoute><AddYearbookEntry /></AdminRoute>} />
      <Route path="/admin/settings"
        element={<AdminRoute><Settings /></AdminRoute>} />

      {/* ── Teacher ── */}
      <Route path="/teacher/dashboard"
        element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
      <Route path="/teacher/students"
        element={<TeacherRoute><Student /></TeacherRoute>} />
      <Route path="/teacher/results"
        element={<TeacherRoute><Result /></TeacherRoute>} />
      <Route path="/teacher/results/view/:id"
        element={<TeacherRoute><ResultCard /></TeacherRoute>} />
      <Route path="/teacher/upload"
        element={<TeacherRoute><UploadResult /></TeacherRoute>} />
      <Route path="/teacher/upload-subject-result"
        element={<TeacherRoute><UploadSubjectResult /></TeacherRoute>} />
      <Route path="/teacher/finalize-result"
        element={<TeacherRoute><FinalizeResult /></TeacherRoute>} />

      {/* ── Accounting ── */}
      <Route path="/admin/accounting"
        element={<AdminRoute><AccountingDashboard /></AdminRoute>} />
      <Route path="/admin/accounting/income"
        element={<AdminRoute><Income /></AdminRoute>} />
      <Route path="/admin/accounting/expenses"
        element={<AdminRoute><Expenses /></AdminRoute>} />
      <Route path="/admin/accounting/ledger"
        element={<AdminRoute><Ledger /></AdminRoute>} />

      {/* ── Fees & Billing ── */}
      <Route path="/admin/fees"                   element={<AdminRoute><Fees /></AdminRoute>} />
      <Route path="/admin/fees/students"          element={<AdminRoute><StudentFees /></AdminRoute>} />
      <Route path="/admin/fees/collect/:id"       element={<AdminRoute><CollectPayment /></AdminRoute>} />
      <Route path="/admin/fees/history"           element={<AdminRoute><PaymentHistory /></AdminRoute>} />
      <Route path="/admin/fees/outstanding"       element={<AdminRoute><OutstandingBalances /></AdminRoute>} />
      <Route path="/admin/fees/receipt/:id"       element={<AdminRoute><ReceiptDetails /></AdminRoute>} />
      <Route path="/admin/receipts"               element={<AdminRoute><Receipts /></AdminRoute>} />
      <Route path="/admin/receipts/:id"           element={<AdminRoute><ReceiptDetails /></AdminRoute>} />
      <Route path="/portal/receipt/:id"           element={<ReceiptDetails />} />

      {/* ── Attendance ── */}
      <Route path="/admin/attendance"             element={<AdminRoute><AttendanceDashboard /></AdminRoute>} />
      <Route path="/admin/attendance/mark"        element={<AdminRoute><MarkAttendance /></AdminRoute>} />
      <Route path="/admin/attendance/report"      element={<AdminRoute><AttendanceReport /></AdminRoute>} />
      <Route path="/admin/attendance/student"     element={<AdminRoute><StudentAttendanceHistory /></AdminRoute>} />
      <Route path="/parent/attendance"            element={<ParentPortalRoute><StudentAttendancePortal /></ParentPortalRoute>} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}