import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.vercel.app";
const PAGE_SIZE = 10;
const fmt  = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const StatusBadge = ({ status }) => {
  const map = { success: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", failed: "bg-red-100 text-red-600" };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>{status}</span>;
};

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Flatten all payments from all fee statements
  const payments = useMemo(() => {
    const all = [];
    fees.forEach(fee => {
      (fee.payments ?? []).forEach(p => {
        all.push({ ...p, fee, student: fee.student });
      });
    });
    return all.sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt));
  }, [fees]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/fees`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setFees(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = payments;
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(p =>
      p.student?.firstName?.toLowerCase().includes(q) ||
      p.student?.lastName?.toLowerCase().includes(q)  ||
      p.reference?.toLowerCase().includes(q)          ||
      p.paystackReference?.toLowerCase().includes(q)
    );
    return list;
  }, [payments, search, statusFilter]);

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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="font-dm-sans text-sm text-gray-400">Fees & Billing</p>
              <h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Payment History</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">All transactions processed through Paystack.</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search student or reference…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-dm-sans text-sm
                             text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors"
                />
              </div>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                           focus:outline-none focus:border-[#f056f0] transition-colors bg-white">
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                  <span className="font-dm-sans text-sm">Loading payments…</span>
                </div>
              ) : pageData.length === 0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No payments found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {["Date","Student","Amount","Reference","Status",""].map(h => (
                            <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pageData.map((p, i) => (
                          <tr key={i} className="hover:bg-[#fdf8ff] transition-colors duration-150">
                            <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">{fmtDate(p.paidAt || p.createdAt)}</td>
                            <td className="px-5 py-4 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">
                              {p.student?.firstName} {p.student?.lastName}
                            </td>
                            <td className="px-5 py-4 font-jost font-bold text-gray-800 whitespace-nowrap">{fmt(p.amount)}</td>
                            <td className="px-5 py-4 font-dm-sans text-gray-400 text-xs whitespace-nowrap">
                              {p.paystackReference || p.reference || "—"}
                            </td>
                            <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => navigate(`/admin/fees/receipt/${p.fee?._id}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200
                                           text-gray-600 text-xs font-dm-sans font-semibold rounded-full transition-colors"
                              >
                                <FaEye className="text-xs" /> Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-dm-sans text-xs text-gray-400">Showing {pageData.length} of {filtered.length} payments</p>
                    <div className="flex items-center gap-2">
                      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">
                        Previous
                      </button>
                      <span className="font-dm-sans text-xs text-gray-500">Page {page} of {totalPages}</span>
                      <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">
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