import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft, FaEdit, FaRedo, FaUserPlus,
  FaPrint, FaArchive, FaGraduationCap, FaUsers,
  FaCalendarAlt, FaMoneyBillWave,
} from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getScholarship, cancelAssignment, renewAssignment } from "../../services/scholarshipApi";

const fmt     = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const statusColors = {
  Active:    "bg-emerald-100 text-emerald-700",
  Inactive:  "bg-gray-100 text-gray-500",
  Expired:   "bg-red-100 text-red-600",
  Cancelled: "bg-orange-100 text-orange-600",
};

const auditColors = {
  Created:   "bg-blue-100 text-blue-700",
  Updated:   "bg-indigo-100 text-indigo-700",
  Awarded:   "bg-emerald-100 text-emerald-700",
  Renewed:   "bg-purple-100 text-purple-700",
  Cancelled: "bg-red-100 text-red-600",
  Expired:   "bg-gray-100 text-gray-500",
};

const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />;

export default function ScholarshipDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [scholarship,  setScholarship]  = useState(null);
  const [beneficiaries,setBeneficiaries]= useState([]);
  const [auditLog,     setAuditLog]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [toast,        setToast]        = useState(null);
  const [renewModal,   setRenewModal]   = useState(null); // assignment id
  const [newExpiry,    setNewExpiry]    = useState("");
  const [renewReason,  setRenewReason]  = useState("");
  const [renewing,     setRenewing]     = useState(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getScholarship(id)
      .then(data => {
        setScholarship(data.scholarship);
        setBeneficiaries(data.beneficiaries ?? []);
        setAuditLog(data.auditLog ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async (assignmentId, studentName) => {
    if (!window.confirm(`Remove scholarship from ${studentName}?`)) return;
    try {
      await cancelAssignment(assignmentId, { reason: "Removed by admin" });
      setBeneficiaries(prev => prev.filter(b => b._id !== assignmentId));
      setScholarship(prev => ({ ...prev, currentBeneficiaries: prev.currentBeneficiaries - 1 }));
      showToast("success", "Scholarship removed from student.");
    } catch (e) {
      showToast("error", e.message);
    }
  };

  const handleRenew = async () => {
    if (!newExpiry) { showToast("error", "Please enter a new expiry date"); return; }
    setRenewing(true);
    try {
      await renewAssignment(renewModal, { newExpiryDate: newExpiry, reason: renewReason });
      showToast("success", "Scholarship renewed successfully.");
      setRenewModal(null);
      setNewExpiry(""); setRenewReason("");
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setRenewing(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const slotsAvailable = scholarship?.maxBeneficiaries !== null
    ? scholarship?.maxBeneficiaries - (scholarship?.currentBeneficiaries ?? 0)
    : "Unlimited";

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#E6EBEE]">
        <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p => !p)} /></div>
        <div className="flex flex-1 overflow-hidden">
          <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
          <main className="w-full overflow-y-auto">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
              <Skeleton className="h-32 w-full" />
              <div className="grid md:grid-cols-4 gap-4">
                {Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-28"/>)}
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <Skeleton className="h-64"/><Skeleton className="h-64"/>
              </div>
              <Skeleton className="h-64 w-full"/>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#E6EBEE]">
        <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p => !p)} /></div>
        <div className="flex flex-1 items-center justify-center">
          <div className="bg-white rounded-2xl p-10 text-center max-w-md">
            <p className="text-red-500 font-dm-sans text-sm mb-4">{error || "Scholarship not found."}</p>
            <button onClick={() => navigate("/admin/scholarships")}
              className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-[#f056f0]">
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <button onClick={() => navigate("/admin/scholarships")}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f056f0] mb-3 transition-colors">
                  <FaArrowLeft /> Back to Scholarships
                </button>
                <h1 className="font-jost font-bold text-2xl text-gray-800">{scholarship.scholarshipName}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="font-dm-sans text-xs bg-gray-50 px-3 py-1 rounded-full text-gray-500">
                    {scholarship.scholarshipCode}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold font-dm-sans
                    ${statusColors[scholarship.status]}`}>{scholarship.status}</span>
                  <span className="font-dm-sans text-xs text-gray-400">{scholarship.type}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => navigate(`/admin/scholarships/award?sch=${id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                             rounded-xl font-dm-sans text-sm font-semibold transition-colors">
                  <FaUserPlus className="text-xs" /> Assign Student
                </button>
                <button onClick={() => navigate(`/admin/scholarships/${id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl
                             font-dm-sans text-sm text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">
                  <FaEdit className="text-xs" /> Edit
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl
                             font-dm-sans text-sm text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">
                  <FaPrint className="text-xs" /> Print
                </button>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <FaGraduationCap />, label: "Type",          value: scholarship.type, color: "bg-[#f056f0]/10 text-[#f056f0]" },
                { icon: <FaMoneyBillWave />, label: "Discount",
                  value: scholarship.discountType === "percentage" ? `${scholarship.discountValue}%` : fmt(scholarship.discountValue),
                  color: "bg-emerald-100 text-emerald-600" },
                { icon: <FaUsers />,         label: "Beneficiaries",
                  value: scholarship.maxBeneficiaries
                    ? `${scholarship.currentBeneficiaries}/${scholarship.maxBeneficiaries}`
                    : scholarship.currentBeneficiaries,
                  color: "bg-blue-100 text-blue-600" },
                { icon: <FaCalendarAlt />,   label: "Ends",          value: fmtDate(scholarship.endDate), color: "bg-amber-100 text-amber-600" },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${c.color}`}>{c.icon}</div>
                  <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mt-3">{c.label}</p>
                  <p className="font-jost font-bold text-xl text-gray-800 mt-1">{c.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">

              {/* Scholarship Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-jost font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3">Scholarship Information</h2>
                <div className="space-y-3">
                  {[
                    { label: "Name",        value: scholarship.scholarshipName },
                    { label: "Code",        value: scholarship.scholarshipCode },
                    { label: "Type",        value: scholarship.type },
                    { label: "Sponsor",     value: scholarship.sponsor || "—" },
                    { label: "Discount",    value: scholarship.discountType === "percentage"
                        ? `${scholarship.discountValue}% off`
                        : `${fmt(scholarship.discountValue)} fixed` },
                    { label: "Session",     value: scholarship.applicableSession || "All Sessions" },
                    { label: "Start Date",  value: fmtDate(scholarship.startDate) },
                    { label: "End Date",    value: fmtDate(scholarship.endDate) },
                    { label: "Max Slots",   value: scholarship.maxBeneficiaries ?? "Unlimited" },
                    { label: "Available",   value: slotsAvailable },
                    { label: "Status",      value: scholarship.status },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="font-dm-sans text-sm text-gray-400">{row.label}</span>
                      <span className="font-dm-sans font-semibold text-gray-700 text-sm text-right max-w-[55%]">{row.value}</span>
                    </div>
                  ))}
                </div>

                {scholarship.applicableClasses?.length > 0 && (
                  <div className="mt-4">
                    <p className="font-dm-sans text-xs text-gray-400 mb-2">Applicable Classes</p>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.applicableClasses.map(cls => (
                        <span key={cls} className="px-2.5 py-1 bg-[#f056f0]/10 text-[#f056f0] rounded-full text-xs font-semibold font-dm-sans">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {scholarship.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="font-dm-sans text-xs text-gray-400 mb-1">Description</p>
                    <p className="font-dm-sans text-sm text-gray-600 leading-6">{scholarship.description}</p>
                  </div>
                )}

                {scholarship.eligibilityRequirements && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="font-dm-sans text-xs text-gray-400 mb-1">Eligibility Requirements</p>
                    <p className="font-dm-sans text-sm text-gray-600 leading-6">{scholarship.eligibilityRequirements}</p>
                  </div>
                )}
              </div>

              {/* Audit Log */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-jost font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3">Activity Log</h2>
                {auditLog.length === 0 ? (
                  <p className="font-dm-sans text-sm text-gray-400 py-10 text-center">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {auditLog.map(a => (
                      <div key={a._id} className="flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-dm-sans flex-shrink-0 mt-0.5
                          ${auditColors[a.action] ?? "bg-gray-100 text-gray-500"}`}>{a.action}</span>
                        <div className="flex-1 min-w-0">
                          {a.student && (
                            <p className="font-dm-sans text-sm font-semibold text-gray-700">
                              {a.student.firstName} {a.student.lastName}
                              <span className="font-normal text-gray-400 ml-1">({a.student.regNumber})</span>
                            </p>
                          )}
                          {a.reason && <p className="font-dm-sans text-xs text-gray-400">{a.reason}</p>}
                        </div>
                        <span className="font-dm-sans text-xs text-gray-400 flex-shrink-0">{fmtDate(a.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Beneficiaries */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-jost font-bold text-gray-800">
                  Current Beneficiaries ({beneficiaries.length})
                </h2>
                <button onClick={() => navigate(`/admin/scholarships/award?sch=${id}`)}
                  className="flex items-center gap-2 text-sm text-[#f056f0] hover:underline font-dm-sans">
                  <FaUserPlus className="text-xs" /> Assign More
                </button>
              </div>

              {beneficiaries.length === 0 ? (
                <div className="py-16 text-center">
                  <FaUsers className="text-3xl text-gray-200 mx-auto mb-3" />
                  <p className="font-dm-sans text-sm text-gray-400">No beneficiaries yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Student","Reg No.","Class","Discount","Balance","Expiry","Actions"].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {beneficiaries.map(b => (
                        <tr key={b._id} className="hover:bg-[#fdf8ff] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {b.student?.profilePhoto ? (
                                <img src={b.student.profilePhoto} alt=""
                                  className="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0"/>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                                  <span className="font-jost font-bold text-[#f056f0] text-[10px]">
                                    {b.student?.firstName?.[0]}{b.student?.lastName?.[0]}
                                  </span>
                                </div>
                              )}
                              <span className="font-dm-sans font-semibold text-gray-700 text-sm">
                                {b.student?.firstName} {b.student?.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-dm-sans text-xs text-gray-500">{b.student?.regNumber}</td>
                          <td className="px-5 py-4 font-dm-sans text-xs text-gray-500">{b.student?.classLevel}</td>
                          <td className="px-5 py-4 font-jost font-bold text-emerald-600 text-sm">{fmt(b.discountAmount)}</td>
                          <td className="px-5 py-4 font-jost font-bold text-[#f056f0] text-sm">{fmt(b.remainingBalance)}</td>
                          <td className="px-5 py-4 font-dm-sans text-xs text-gray-400">{fmtDate(b.expiryDate)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setRenewModal(b._id)}
                                className="text-indigo-400 hover:text-indigo-600 transition-colors" title="Renew">
                                <FaRedo className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleCancel(b._id, `${b.student?.firstName} ${b.student?.lastName}`)}
                                className="text-red-400 hover:text-red-600 transition-colors" title="Remove">
                                <FaArchive className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Renew Modal */}
      {renewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-jost font-bold text-gray-800">Renew Scholarship</h3>
            <div>
              <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                New Expiry Date *
              </label>
              <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                           focus:outline-none focus:border-[#f056f0] transition-colors" />
            </div>
            <div>
              <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                Reason
              </label>
              <input type="text" value={renewReason} onChange={e => setRenewReason(e.target.value)}
                placeholder="e.g. Continued academic excellence"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                           focus:outline-none focus:border-[#f056f0] transition-colors" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setRenewModal(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-dm-sans text-sm text-gray-600
                           hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">Cancel</button>
              <button onClick={handleRenew} disabled={renewing}
                className={`flex-1 py-2.5 rounded-xl font-dm-sans text-sm font-semibold text-white transition-colors
                  ${renewing ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {renewing ? "Renewing..." : "Renew"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}