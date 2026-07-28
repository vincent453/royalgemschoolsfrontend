import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUsers, FaRedo, FaTimes, FaEye } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getBeneficiaries, cancelAssignment, renewAssignment, getScholarships } from "../../services/scholarshipApi";

const fmt     = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const CLASSES  = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3","Kindergarten","Nursery 1","Nursery 2"];
const STATUSES = ["Active","Expired","Cancelled","Renewed"];

const statusColors = {
  Active:    "bg-emerald-100 text-emerald-700",
  Expired:   "bg-red-100 text-red-600",
  Cancelled: "bg-orange-100 text-orange-600",
  Renewed:   "bg-purple-100 text-purple-700",
};

const Skeleton = ({ rows = 8 }) => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-4">
        <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-40" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
        </div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
      </div>
    ))}
  </div>
);

export default function Beneficiaries() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [assignments,   setAssignments]   = useState([]);
  const [scholarships,  setScholarships]  = useState([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [toast,         setToast]         = useState(null);
  const [renewModal,    setRenewModal]    = useState(null);
  const [newExpiry,     setNewExpiry]     = useState("");
  const [renewReason,   setRenewReason]   = useState("");
  const [renewing,      setRenewing]      = useState(false);

  const [search,        setSearch]        = useState("");
  const [classLevel,    setClassLevel]    = useState("");
  const [scholarshipId, setScholarshipId] = useState("");
  const [status,        setStatus]        = useState("Active");

  const LIMIT = 20;

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getBeneficiaries({ classLevel, scholarshipId, status, search, page: p, limit: LIMIT });
      setAssignments(data.assignments ?? []);
      setTotal(data.total ?? 0);
      setPage(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getScholarships({ limit: 100 }).then(d => setScholarships(d.scholarships ?? [])).catch(() => {});
    fetchData(1);
  }, []);

  const handleCancel = async (id, name) => {
    if (!window.confirm(`Remove scholarship from ${name}?`)) return;
    try {
      await cancelAssignment(id, { reason: "Removed by admin" });
      setAssignments(prev => prev.filter(a => a._id !== id));
      setTotal(t => t - 1);
      showToast("success", "Scholarship removed.");
    } catch (e) {
      showToast("error", e.message);
    }
  };

  const handleRenew = async () => {
    if (!newExpiry) { showToast("error", "Please set a new expiry date"); return; }
    setRenewing(true);
    try {
      await renewAssignment(renewModal, { newExpiryDate: newExpiry, reason: renewReason });
      showToast("success", "Scholarship renewed.");
      setRenewModal(null); setNewExpiry(""); setRenewReason("");
      fetchData(page);
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

  const pages = Math.ceil(total / LIMIT);

  const inputClass = `border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                      placeholder-gray-300 focus:outline-none focus:border-[#f056f0] transition-colors bg-white`;

  const totalDiscount = assignments.reduce((s, a) => s + (a.discountAmount ?? 0), 0);

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
          <div className="max-w-7xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-2xl text-gray-800">Beneficiaries</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  {total} student{total !== 1 ? "s" : ""} on scholarship
                </p>
              </div>
              <button onClick={() => navigate("/admin/scholarships/award")}
                className="flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                           px-5 py-2.5 rounded-full font-jost font-semibold text-sm transition-colors shadow-sm">
                Award Scholarship
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Total Beneficiaries", value: total,                color: "text-gray-800"    },
                { label: "Total Discount Value",value: fmt(totalDiscount),   color: "text-emerald-600" },
                { label: "Active Only",         value: assignments.filter(a => a.status === "Active").length, color: "text-[#f056f0]" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-2">{s.label}</p>
                  <p className={`font-jost font-bold text-2xl ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="relative flex-[2] min-w-[180px]">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <input type="text" placeholder="Search student name or reg..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`${inputClass} pl-9 w-full`} />
                </div>
                <select value={classLevel} onChange={e => setClassLevel(e.target.value)} className={`${inputClass} flex-1 min-w-[140px]`}>
                  <option value="">All Classes</option>
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={scholarshipId} onChange={e => setScholarshipId(e.target.value)} className={`${inputClass} flex-1 min-w-[180px]`}>
                  <option value="">All Scholarships</option>
                  {scholarships.map(s => <option key={s._id} value={s._id}>{s.scholarshipName}</option>)}
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)} className={`${inputClass} flex-1 min-w-[130px]`}>
                  <option value="">All Status</option>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => fetchData(1)}
                  className="px-6 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                             font-dm-sans text-sm font-semibold transition-colors">Filter</button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">{error}</div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100
                              grid-cols-[2.5fr_1fr_1.5fr_1fr_1fr_1fr_1fr_auto]">
                {["Student","Class","Scholarship","Discount","Balance","Status","Expiry",""].map((h,i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                ))}
              </div>

              {loading ? <Skeleton /> : assignments.length === 0 ? (
                <div className="py-20 text-center">
                  <FaUsers className="text-4xl text-gray-200 mx-auto mb-3" />
                  <p className="font-dm-sans text-sm text-gray-400">No beneficiaries found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {assignments.map(a => (
                    <div key={a._id}
                      className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-3
                                 px-6 py-4 items-center hover:bg-[#fdf8ff] transition-colors">
                      <div className="flex items-center gap-3">
                        {a.student?.profilePhoto ? (
                          <img src={a.student.profilePhoto} alt=""
                            className="w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0"/>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-jost font-bold text-[#f056f0] text-xs">
                              {a.student?.firstName?.[0]}{a.student?.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-dm-sans font-semibold text-gray-700 text-sm">
                            {a.student?.firstName} {a.student?.lastName}
                          </p>
                          <p className="font-dm-sans text-xs text-gray-400">{a.student?.regNumber}</p>
                        </div>
                      </div>
                      <span className="font-dm-sans text-xs text-gray-500">{a.student?.classLevel}</span>
                      <div>
                        <p className="font-dm-sans text-xs font-semibold text-gray-700 truncate">{a.scholarship?.scholarshipName}</p>
                        <p className="font-dm-sans text-[10px] text-gray-400">{a.scholarship?.type}</p>
                      </div>
                      <span className="font-jost font-bold text-sm text-emerald-600">{fmt(a.discountAmount)}</span>
                      <span className="font-jost font-bold text-sm text-[#f056f0]">{fmt(a.remainingBalance)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans w-fit
                        ${statusColors[a.status] ?? "bg-gray-100 text-gray-500"}`}>{a.status}</span>
                      <span className="font-dm-sans text-xs text-gray-400">{fmtDate(a.expiryDate)}</span>

                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/scholarships/student/${a.student?._id}`)}
                          className="text-gray-300 hover:text-[#f056f0] transition-colors" title="View Profile">
                          <FaEye className="text-sm" />
                        </button>
                        {a.status === "Active" && (
                          <>
                            <button onClick={() => setRenewModal(a._id)}
                              className="text-indigo-300 hover:text-indigo-500 transition-colors" title="Renew">
                              <FaRedo className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleCancel(a._id, `${a.student?.firstName} ${a.student?.lastName}`)}
                              className="text-red-300 hover:text-red-500 transition-colors" title="Remove">
                              <FaTimes className="text-sm" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="font-dm-sans text-xs text-gray-400">
                    Showing {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => fetchData(page-1)} disabled={page===1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 font-dm-sans text-xs
                                 hover:border-[#f056f0] disabled:opacity-40 transition-colors">Prev</button>
                    <button onClick={() => fetchData(page+1)} disabled={page===pages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 font-dm-sans text-xs
                                 hover:border-[#f056f0] disabled:opacity-40 transition-colors">Next</button>
                  </div>
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
              <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">New Expiry Date *</label>
              <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                           focus:outline-none focus:border-[#f056f0] transition-colors" />
            </div>
            <div>
              <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">Reason</label>
              <input type="text" value={renewReason} onChange={e => setRenewReason(e.target.value)}
                placeholder="Reason for renewal"
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