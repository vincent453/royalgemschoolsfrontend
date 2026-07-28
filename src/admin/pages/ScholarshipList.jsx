import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaEye,
  FaRedo, FaUserPlus, FaGraduationCap, FaEllipsisV,
} from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getScholarships, deleteScholarship } from "../../services/scholarshipApi";

const fmt     = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const TYPES    = ["Academic","Sports","Government","Private","NGO","Religious","Staff Ward","Merit","Need Based","Full","Partial"];
const STATUSES = ["Active","Inactive","Expired","Cancelled"];

const statusColors = {
  Active:    "bg-emerald-100 text-emerald-700",
  Inactive:  "bg-gray-100 text-gray-500",
  Expired:   "bg-red-100 text-red-600",
  Cancelled: "bg-orange-100 text-orange-600",
};

const Skeleton = ({ rows = 6 }) => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-4">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-28" />
        <div className="h-3 bg-gray-100 rounded animate-pulse flex-1" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
      </div>
    ))}
  </div>
);

export default function ScholarshipList() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scholarships, setScholarships] = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [openMenu,     setOpenMenu]     = useState(null);
  const [toast,        setToast]        = useState(null);

  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("");
  const [type,    setType]    = useState("");
  const [sponsor, setSponsor] = useState("");

  const LIMIT = 20;

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getScholarships({ search, status, type, sponsor, page: p, limit: LIMIT });
      setScholarships(data.scholarships ?? []);
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
    fetchData(1);
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteScholarship(id);
      setScholarships(prev => prev.filter(s => s._id !== id));
      setTotal(t => t - 1);
      showToast("success", "Scholarship deleted.");
    } catch (e) {
      showToast("error", e.message);
    }
    setOpenMenu(null);
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const pages = Math.ceil(total / LIMIT);

  const inputClass = `border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                      placeholder-gray-300 focus:outline-none focus:border-[#f056f0] transition-colors bg-white`;

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
                <h1 className="font-jost font-bold text-2xl text-gray-800">Scholarships</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">{total} scholarship{total !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => navigate("/admin/scholarships/new")}
                className="flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                           px-5 py-2.5 rounded-full font-jost font-semibold text-sm transition-colors shadow-sm">
                <FaPlus className="text-xs" /> New Scholarship
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="relative flex-[2] min-w-[180px]">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <input type="text" placeholder="Search name, code, sponsor..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`${inputClass} pl-9 w-full`} />
                </div>
                <select value={status} onChange={e => setStatus(e.target.value)} className={`${inputClass} flex-1 min-w-[140px]`}>
                  <option value="">All Status</option>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={type} onChange={e => setType(e.target.value)} className={`${inputClass} flex-1 min-w-[160px]`}>
                  <option value="">All Types</option>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input type="text" placeholder="Sponsor..." value={sponsor}
                  onChange={e => setSponsor(e.target.value)} className={`${inputClass} flex-1 min-w-[140px]`} />
                <button onClick={() => fetchData(1)}
                  className="px-6 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                             font-dm-sans text-sm font-semibold transition-colors">
                  Search
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">{error}</div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100
                              grid-cols-[1.2fr_2fr_1fr_1.2fr_1fr_0.8fr_1fr_1fr_auto]">
                {["Code","Name","Type","Sponsor","Discount","Slots","Status","End Date",""].map((h, i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                ))}
              </div>

              {loading ? <Skeleton /> : scholarships.length === 0 ? (
                <div className="py-20 text-center">
                  <FaGraduationCap className="text-4xl text-gray-200 mx-auto mb-3" />
                  <p className="font-dm-sans text-sm text-gray-400">No scholarships found.</p>
                  <button onClick={() => navigate("/admin/scholarships/new")}
                    className="mt-4 px-6 py-2.5 bg-[#f056f0] text-white rounded-full font-dm-sans text-sm font-semibold hover:bg-[#525fe1] transition-colors">
                    Create First Scholarship
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {scholarships.map(s => (
                    <div key={s._id}
                      className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr_1fr_1.2fr_1fr_0.8fr_1fr_1fr_auto] gap-3
                                 px-6 py-4 items-center hover:bg-[#fdf8ff] transition-colors">
                      <span className="font-dm-sans text-xs font-bold text-[#f056f0]">{s.scholarshipCode}</span>
                      <div>
                        <p className="font-dm-sans font-semibold text-gray-700 text-sm">{s.scholarshipName}</p>
                        {s.applicableSession && <p className="font-dm-sans text-xs text-gray-400">{s.applicableSession}</p>}
                      </div>
                      <span className="font-dm-sans text-xs text-gray-500">{s.type}</span>
                      <span className="font-dm-sans text-xs text-gray-500 truncate">{s.sponsor || "—"}</span>
                      <span className="font-jost font-bold text-sm text-gray-700">
                        {s.discountType === "percentage" ? `${s.discountValue}%` : fmt(s.discountValue)}
                      </span>
                      <span className="font-dm-sans text-xs text-gray-500">
                        {s.maxBeneficiaries
                          ? `${s.currentBeneficiaries}/${s.maxBeneficiaries}`
                          : s.currentBeneficiaries}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans w-fit
                        ${statusColors[s.status] ?? "bg-gray-100 text-gray-500"}`}>{s.status}</span>
                      <span className="font-dm-sans text-xs text-gray-400">{fmtDate(s.endDate)}</span>

                      {/* Actions */}
                      <div className="relative">
                        <button onClick={() => setOpenMenu(openMenu === s._id ? null : s._id)}
                          className="text-gray-300 hover:text-[#f056f0] transition-colors p-1">
                          <FaEllipsisV className="text-sm" />
                        </button>
                        {openMenu === s._id && (
                          <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100
                                          py-1 z-20 min-w-[160px]">
                            {[
                              { icon: <FaEye />,      label: "View Details",  action: () => navigate(`/admin/scholarships/${s._id}`) },
                              { icon: <FaEdit />,     label: "Edit",          action: () => navigate(`/admin/scholarships/${s._id}/edit`) },
                              { icon: <FaUserPlus />, label: "Assign Student",action: () => navigate(`/admin/scholarships/award?sch=${s._id}`) },
                              { icon: <FaRedo />,     label: "Renew",         action: () => navigate(`/admin/scholarships/${s._id}/edit`) },
                            ].map(item => (
                              <button key={item.label}
                                onClick={() => { item.action(); setOpenMenu(null); }}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-dm-sans
                                           text-gray-600 hover:bg-[#fdf8ff] hover:text-[#f056f0] transition-colors">
                                <span className="text-xs">{item.icon}</span> {item.label}
                              </button>
                            ))}
                            <button onClick={() => handleDelete(s._id, s.scholarshipName)}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-dm-sans
                                         text-red-400 hover:bg-red-50 transition-colors">
                              <FaTrash className="text-xs" /> Delete
                            </button>
                          </div>
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

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}