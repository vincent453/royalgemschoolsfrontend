import { Routes, Route, Navigate } from "react-router-dom";

// Public
import Home       from "../public/pages/Home";
import About      from "../public/pages/About";
import EducationalServices from "../public/pages/EducationalServices";
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
import ScholarshipDashboard from "../admin/pages/ScholarshipDashboard";
import ScholarshipList      from "../admin/pages/ScholarshipList";
import ScholarshipForm      from "../admin/pages/ScholarshipForm";
import ScholarshipDetails   from "../admin/pages/Scholarshipdetails";
import AwardScholarship     from "../admin/pages/AwardScholarship";
import Beneficiaries        from "../admin/pages/Beneficiaries";
import ScholarshipReports   from "../admin/pages/ScholarshipReports";
import StudentScholarshipProfile from "../admin/pages/StudentScholarshipProfile";
import LearningDashboard from "../admin/pages/LearningDashboard";
import StudentLearningPortal from "../admin/pages/StudentLearningPortal";
import StudentAssignments from "../admin/pages/StudentAssignments";
import StudentResources from "../admin/pages/StudentResources";

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
  AccountantRoute,
  InventoryManagerRoute,
  FinanceRoute,
  InventoryRoute,
  StudentPortalRoute,
  ParentPortalRoute,
} from "./ProtectedRoutes";
import InventoryDashboard from "../admin/pages/InventoryDashboard";
import InventoryItems from "../admin/pages/InventoryItems";
import InventoryItemDetails from "../admin/pages/InventoryItemDetails";
import Suppliers from "../admin/pages/Suppliers";
import Purchases from "../admin/pages/Purchases";
import StockMovements from "../admin/pages/StockMovement";
import LowStock from "../admin/pages/LowStock";
import EditUser from "../admin/pages/EditUser";
import ShopDashboard from "../admin/pages/ShopDashboard";
import ShopProducts from "../admin/pages/ShopProduct";
import ProductForm from "../admin/pages/ProductForm";
import OrderDetails from "../admin/pages/OderDetail";
import ShopOrders from "../admin/pages/ShopOrders";
import PortalShop from "../admin/pages/PortalShop";
import MyOrders from "../admin/pages/MyOrders";
import ShopCategories from "../admin/pages/ShopCategories";
import ShopCustomers from "../admin/pages/ShopCustomers";
import SalesReport from "../admin/pages/SalesReport";
import TeacherAssignments from "../admin/pages/TeacherAssignments";
import TeacherSubmissions from "../admin/pages/TeacherSubmissions";
import TeacherResources from "../admin/pages/TeacherResources";



export default function AppRoutes() {
  return (
    <Routes>

      {/* ════════════════════════════════════════════
          PUBLIC
      ════════════════════════════════════════════ */}
      <Route path="/"           element={<Home />}       />
      <Route path="/about"      element={<About />}      />
      <Route path="/educational-services" element={<EducationalServices />} />
      <Route path="/contact"    element={<Contact />}    />
      <Route path="/admissions" element={<Admissions />} />
      <Route path="/yearbook"   element={<Yearbook />}   />
      <Route path="/blog"       element={<Blog />}       />

      {/* ════════════════════════════════════════════
          PORTAL LOGIN
      ════════════════════════════════════════════ */}
      <Route path="/portal" element={<Portal />} />

      {/* ════════════════════════════════════════════
          STUDENT PORTAL
      ════════════════════════════════════════════ */}
      <Route path="/student/dashboard"
        element={<StudentPortalRoute><StudentDashboard /></StudentPortalRoute>} />
      <Route path="/student/learning"
        element={<StudentPortalRoute><StudentLearningPortal /></StudentPortalRoute>} />
      <Route path="/student/assignments"
        element={<StudentPortalRoute><StudentAssignments /></StudentPortalRoute>} />
      <Route path="/student/resources"
        element={<StudentPortalRoute><StudentResources /></StudentPortalRoute>} />

      {/* ════════════════════════════════════════════
          PARENT PORTAL
      ════════════════════════════════════════════ */}
      <Route path="/parent/dashboard"
        element={<ParentPortalRoute><ParentDashboard /></ParentPortalRoute>} />
      <Route path="/parent/attendance"
        element={<ParentPortalRoute><StudentAttendancePortal /></ParentPortalRoute>} />

      {/* ── Portal: shop ── */}
      <Route path="/portal/shop"
        element={<PortalShop />} />
      <Route path="/portal/shop/orders"
        element={<MyOrders />} />

      {/* ── Portal: shared pages (no role gate needed) ── */}
      <Route path="/portal/results/:id" element={<ResultCard />}    />
      <Route path="/portal/receipt/:id" element={<ReceiptDetails />} />

      {/* ════════════════════════════════════════════
          STAFF LOGIN
      ════════════════════════════════════════════ */}
      <Route path="/admin/portal" element={<AdminLogin />} />

      {/* ════════════════════════════════════════════
          ADMIN — Core
      ════════════════════════════════════════════ */}
      <Route path="/admin/dashboard"
        element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Students */}
      <Route path="/admin/students"
        element={<AdminRoute><Student /></AdminRoute>} />
      <Route path="/admin/students/add"
        element={<AdminRoute><AddStudent /></AdminRoute>} />
      <Route path="/admin/students/edit/:id"
        element={<AdminRoute><EditStudent /></AdminRoute>} />

      {/* Teachers */}
      <Route path="/admin/teachers"
        element={<AdminRoute><Teacher /></AdminRoute>} />
      <Route path="/admin/teachers/add"
        element={<AdminRoute><AddTeachers /></AdminRoute>} />

      {/* Users */}
      <Route path="/admin/users"
        element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/addUsers"
        element={<AdminRoute><AddUser /></AdminRoute>} />
      <Route path="/admin/users/edit/:id"
        element={<AdminRoute><EditUser /></AdminRoute>} />

      {/* Results */}
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

      {/* Scholarship module */}
      <Route path="/admin/scholarships"
        element={<AdminRoute><ScholarshipList /></AdminRoute>} />
      <Route path="/admin/scholarships/dashboard"
        element={<AdminRoute><ScholarshipDashboard /></AdminRoute>} />
      <Route path="/admin/scholarships/new"
        element={<AdminRoute><ScholarshipForm /></AdminRoute>} />
      <Route path="/admin/scholarships/:id"
        element={<AdminRoute><ScholarshipDetails /></AdminRoute>} />
      <Route path="/admin/scholarships/:id/edit"
        element={<AdminRoute><ScholarshipForm /></AdminRoute>} />
      <Route path="/admin/scholarships/award"
        element={<AdminRoute><AwardScholarship /></AdminRoute>} />
      <Route path="/admin/scholarships/beneficiaries"
        element={<AdminRoute><Beneficiaries /></AdminRoute>} />
      <Route path="/admin/scholarships/reports"
        element={<AdminRoute><ScholarshipReports /></AdminRoute>} />
      <Route path="/admin/scholarships/student/:id"
        element={<AdminRoute><StudentScholarshipProfile /></AdminRoute>} />

      {/* Learning module */}
      <Route path="/admin/learning"
        element={<AdminRoute><LearningDashboard /></AdminRoute>} />
      <Route path="/admin/learning/assignments"
        element={<AdminRoute><TeacherAssignments /></AdminRoute>} />
      <Route path="/admin/learning/resources"
        element={<AdminRoute><TeacherResources /></AdminRoute>} />
      <Route path="/admin/learning/submissions/:id"
        element={<AdminRoute><TeacherSubmissions /></AdminRoute>} />

      {/* Misc admin */}
      <Route path="/admin/generatepin"
        element={<AdminRoute><GeneratePin /></AdminRoute>} />
      <Route path="/admin/addyearbookentry"
        element={<AdminRoute><AddYearbookEntry /></AdminRoute>} />
      <Route path="/admin/settings"
        element={<AdminRoute><Settings /></AdminRoute>} />

      {/* ════════════════════════════════════════════
          TEACHER
      ════════════════════════════════════════════ */}
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
      <Route path="/teacher/lms/assignments"
        element={<TeacherRoute><TeacherAssignments /></TeacherRoute>} />
      <Route path="/teacher/lms/submissions/:id"
        element={<TeacherRoute><TeacherSubmissions /></TeacherRoute>} />
      <Route path="/teacher/lms/resources"
        element={<TeacherRoute><TeacherResources /></TeacherRoute>} />

      {/* ════════════════════════════════════════════
          ACCOUNTANT
      ════════════════════════════════════════════ */}
      <Route path="/accountant" element={<AccountantRoute><AccountingDashboard /></AccountantRoute>} />
      <Route path="/accountant/fees" element={<AccountantRoute><Fees /></AccountantRoute>} />
      <Route path="/accountant/payments" element={<AccountantRoute><PaymentHistory /></AccountantRoute>} />
      <Route path="/accountant/receipts" element={<AccountantRoute><Receipts /></AccountantRoute>} />
      <Route path="/accountant/expenses" element={<AccountantRoute><Expenses /></AccountantRoute>} />
      <Route path="/accountant/reports" element={<AccountantRoute><Ledger /></AccountantRoute>} />
      <Route path="/accountant/fees/collect/:id" element={<AccountantRoute><CollectPayment /></AccountantRoute>} />
      <Route path="/accountant/fees/receipt/:id" element={<AccountantRoute><ReceiptDetails /></AccountantRoute>} />
      <Route path="/accountant/receipts/:id" element={<AccountantRoute><ReceiptDetails /></AccountantRoute>} />

      {/* ════════════════════════════════════════════
          INVENTORY MANAGER
      ════════════════════════════════════════════ */}
      <Route path="/inventory" element={<InventoryManagerRoute><InventoryDashboard /></InventoryManagerRoute>} />
      <Route path="/inventory/items" element={<InventoryManagerRoute><InventoryItems /></InventoryManagerRoute>} />
      <Route path="/inventory/purchases" element={<InventoryManagerRoute><Purchases /></InventoryManagerRoute>} />
      <Route path="/inventory/usage" element={<InventoryManagerRoute><StockMovements /></InventoryManagerRoute>} />
      <Route path="/inventory/history" element={<InventoryManagerRoute><StockMovements /></InventoryManagerRoute>} />
      <Route path="/inventory/reports" element={<InventoryManagerRoute><LowStock /></InventoryManagerRoute>} />
      <Route path="/inventory/items/:id" element={<InventoryManagerRoute><InventoryItemDetails /></InventoryManagerRoute>} />
      <Route path="/inventory/suppliers" element={<InventoryManagerRoute><Suppliers /></InventoryManagerRoute>} />
      <Route path="/inventory/stock-movement" element={<InventoryManagerRoute><StockMovements /></InventoryManagerRoute>} />
      <Route path="/inventory/alerts" element={<InventoryManagerRoute><LowStock /></InventoryManagerRoute>} />

      {/* ════════════════════════════════════════════
          ACCOUNTING
      ════════════════════════════════════════════ */}
      <Route path="/admin/accounting"
        element={<FinanceRoute><AccountingDashboard /></FinanceRoute>} />
      <Route path="/admin/accounting/income"
        element={<FinanceRoute><Income /></FinanceRoute>} />
      <Route path="/admin/accounting/expenses"
        element={<FinanceRoute><Expenses /></FinanceRoute>} />
      <Route path="/admin/accounting/ledger"
        element={<FinanceRoute><Ledger /></FinanceRoute>} />

      {/* ════════════════════════════════════════════
          FEES & BILLING
      ════════════════════════════════════════════ */}
      <Route path="/admin/fees"
        element={<FinanceRoute><Fees /></FinanceRoute>} />
      <Route path="/admin/fees/students"
        element={<AdminRoute><StudentFees /></AdminRoute>} />
      <Route path="/admin/fees/collect/:id"
        element={<AdminRoute><CollectPayment /></AdminRoute>} />
      <Route path="/admin/fees/history"
        element={<FinanceRoute><PaymentHistory /></FinanceRoute>} />
      <Route path="/admin/fees/outstanding"
        element={<AdminRoute><OutstandingBalances /></AdminRoute>} />
      <Route path="/admin/fees/receipt/:id"
        element={<FinanceRoute><ReceiptDetails /></FinanceRoute>} />
      <Route path="/admin/receipts"
        element={<FinanceRoute><Receipts /></FinanceRoute>} />
      <Route path="/admin/receipts/:id"
        element={<FinanceRoute><ReceiptDetails /></FinanceRoute>} />

      {/* ════════════════════════════════════════════
          ATTENDANCE
      ════════════════════════════════════════════ */}
      <Route path="/admin/attendance"
        element={<AdminRoute><AttendanceDashboard /></AdminRoute>} />
      <Route path="/admin/attendance/mark"
        element={<AdminRoute><MarkAttendance /></AdminRoute>} />
      <Route path="/admin/attendance/report"
        element={<AdminRoute><AttendanceReport /></AdminRoute>} />
      <Route path="/admin/attendance/student"
        element={<AdminRoute><StudentAttendanceHistory /></AdminRoute>} />

      {/* ════════════════════════════════════════════
          INVENTORY
      ════════════════════════════════════════════ */}
      <Route path="/admin/inventory"
        element={<InventoryRoute><InventoryDashboard /></InventoryRoute>} />
      <Route path="/admin/inventory/items"
        element={<InventoryRoute><InventoryItems /></InventoryRoute>} />
      <Route path="/admin/inventory/items/:id"
        element={<InventoryRoute><InventoryItemDetails /></InventoryRoute>} />
      <Route path="/admin/inventory/suppliers"
        element={<InventoryRoute><Suppliers /></InventoryRoute>} />
      <Route path="/admin/inventory/purchases"
        element={<InventoryRoute><Purchases /></InventoryRoute>} />
      <Route path="/admin/inventory/stock-movement"
        element={<InventoryRoute><StockMovements /></InventoryRoute>} />
      <Route path="/admin/inventory/low-stock"
        element={<InventoryRoute><LowStock /></InventoryRoute>} />

      {/* ════════════════════════════════════════════
          ONLINE SHOP — Admin
      ════════════════════════════════════════════ */}
      <Route path="/admin/shop"
        element={<AdminRoute><ShopDashboard /></AdminRoute>} />
      <Route path="/admin/shop/products"
        element={<AdminRoute><ShopProducts /></AdminRoute>} />
      <Route path="/admin/shop/products/new"
        element={<AdminRoute><ProductForm /></AdminRoute>} />
      <Route path="/admin/shop/products/:id"
        element={<AdminRoute><ProductForm /></AdminRoute>} />
      <Route path="/admin/shop/orders"
        element={<AdminRoute><ShopOrders /></AdminRoute>} />
      <Route path="/admin/shop/orders/:id"
        element={<AdminRoute><OrderDetails /></AdminRoute>} />
      <Route path="/admin/shop/categories"
        element={<AdminRoute><ShopCategories /></AdminRoute>} />
      <Route path="/admin/shop/customers"
        element={<AdminRoute><ShopCustomers /></AdminRoute>} />
      <Route path="/admin/shop/report"
        element={<AdminRoute><SalesReport /></AdminRoute>} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}


