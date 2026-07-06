import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaEye, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.vercel.app";
const PAGE_SIZE = 10;

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const StatusBadge = ({ status }) => {
  const map = {
    paid:    "bg-emerald-100 text-emerald-700",
    partial: "bg-amber-100 text-amber-700",
    pending: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

const TERMS    = ["", "1st Term", "2nd Term", "3rd Term"];
const CLASSES  = ['', 'Reception 1', 'Reception 2', 'Pre-k', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3']


export default function StudentFees() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [classFilter,   setClassFilter]   = useState("");
  const [termFilter,    setTermFilter]    = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (classFilter)   params.set("classLevel", classFilter);
      if (termFilter)    params.set("term", termFilter);
      if (sessionFilter) params.set("session", sessionFilter);
      const res  = await fetch(`${API}/api/fees?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFees(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [classFilter, termFilter, sessionFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fees;
    return fees.filter((f) =>
      f.student?.firstName?.toLowerCase().includes(q) ||
      f.student?.lastName?.toLowerCase().includes(q)  ||
      f.student?.regNumber?.toLowerCase().includes(q) ||
      f.reference?.toLowerCase().includes(q)
    );
  }, [fees, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="font-dm-sans text-sm text-gray-400">Fees & Billing</p>
              <h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Student Fees</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">
                View fee statements, balances and payment status for all students.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search student or reference..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-dm-sans text-sm
                               text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors"
                  />
                </div>

                {/* Class */}
                <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                             focus:outline-none focus:border-[#f056f0] transition-colors bg-white">
                  <option value="">All Classes</option>
                  {CLASSES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
                </select>

                {/* Term */}
                <select value={termFilter} onChange={e => { setTermFilter(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                             focus:outline-none focus:border-[#f056f0] transition-colors bg-white">
                  <option value="">All Terms</option>
                  {TERMS.filter(Boolean).map(t => <option key={t}>{t}</option>)}
                </select>

                {/* Session */}
                <input
                  value={sessionFilter}
                  onChange={e => { setSessionFilter(e.target.value); setPage(1); }}
                  placeholder="Session e.g. 2024/2025"
                  className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                             focus:outline-none focus:border-[#f056f0] transition-colors placeholder-gray-300"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                  <span className="font-dm-sans text-sm">Loading fee statements…</span>
                </div>
              ) : pageData.length === 0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">
                  No fee statements found.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {["Student","Reg No","Class","Total Fee","Paid","Balance","Status",""].map(h => (
                            <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pageData.map(fee => (
                          <tr key={fee._id} className="hover:bg-[#fdf8ff] transition-colors duration-150">
                            <td className="px-5 py-4 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">
                              {fee.student?.firstName} {fee.student?.lastName}
                            </td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">
                              {fee.student?.regNumber}
                            </td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">
                              {fee.classLevel}
                            </td>
                            <td className="px-5 py-4 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">
                              {fmt(fee.amountDue)}
                            </td>
                            <td className="px-5 py-4 font-dm-sans text-emerald-600 font-semibold whitespace-nowrap">
                              {fmt(fee.amountPaid)}
                            </td>
                            <td className="px-5 py-4 font-dm-sans text-red-500 font-semibold whitespace-nowrap">
                              {fmt(fee.balance)}
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge status={fee.status} />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/admin/fees/receipt/${fee._id}`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200
                                             text-gray-600 text-xs font-dm-sans font-semibold rounded-full transition-colors"
                                >
                                  <FaEye className="text-xs" /> View
                                </button>
                                {fee.status !== "paid" && (
                                  <button
                                    onClick={() => navigate(`/admin/fees/collect/${fee._id}`)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f056f0] hover:bg-[#525fe1]
                                               text-white text-xs font-dm-sans font-semibold rounded-full transition-colors"
                                  >
                                    <FaMoneyBillWave className="text-xs" /> Pay
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-dm-sans text-xs text-gray-400">
                      Showing {pageData.length} of {filtered.length} statements
                    </p>
                    <div className="flex items-center gap-2">
                      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold
                                   text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">
                        Previous
                      </button>
                      <span className="font-dm-sans text-xs text-gray-500">Page {page} of {totalPages}</span>
                      <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold
                                   text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  ); 
}