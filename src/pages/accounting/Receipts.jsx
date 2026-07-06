import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaEye, FaDownload, FaPrint, FaReceipt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getReceipts, getReceiptStats, downloadReceiptPdf } from "../../services/receiptApi";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-jost font-bold text-xl text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

const RANGE_OPTIONS = [
  { value: "",      label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
];

export default function Receipts() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [receipts,    setReceipts]    = useState([]);
  const [pagination,  setPagination]  = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState("");
  const [page,   setPage]   = useState(1);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReceipts({ search, range, page, limit: 10 });
      setReceipts(data.receipts ?? []);
      setPagination(data.pagination ?? { page: 1, totalPages: 1, total: 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReceiptStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [range, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDownload = async (receipt) => {
    setDownloadingId(receipt._id);
    try {
      await downloadReceiptPdf(receipt._id, `${receipt.receiptNumber}.pdf`);
    } catch (e) {
      alert(e.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePrint = (receipt) => {
    navigate(`/admin/receipts/${receipt._id}?print=1`);
  };

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
              <h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Receipt Management</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">
                All payment receipts, auto-generated on successful payment.
              </p>
            </div>

            {/* Stat cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<FaReceipt className="text-[#f056f0]" />} label="Total Receipts" value={stats.totalReceipts} color="bg-pink-50" />
                <StatCard icon={<FaReceipt className="text-emerald-500" />} label="Today's Collections" value={fmt(stats.todayCollections)} color="bg-emerald-50" />
                <StatCard icon={<FaReceipt className="text-indigo-500" />} label="Monthly Collections" value={fmt(stats.monthCollections)} color="bg-indigo-50" />
                <StatCard icon={<FaReceipt className="text-amber-500" />} label="Total Revenue" value={fmt(stats.totalRevenue)} color="bg-amber-50" />
              </div>
            )}

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            {/* Filters */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[220px]">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Receipt no, student, reg number or reference..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-dm-sans text-sm
                             text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors"
                />
              </div>
              <select value={range} onChange={e => { setRange(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                           focus:outline-none focus:border-[#f056f0] bg-white transition-colors">
                {RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button type="submit"
                className="px-6 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm
                           font-semibold rounded-full transition-colors">
                Search
              </button>
            </form>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                  <span className="font-dm-sans text-sm">Loading receipts…</span>
                </div>
              ) : receipts.length === 0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No receipts found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {["Receipt #","Student","Class","Amount","Method","Reference","Status","Date",""].map(h => (
                            <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {receipts.map(r => (
                          <tr key={r._id} className="hover:bg-[#fdf8ff] transition-colors duration-150">
                            <td className="px-5 py-4 font-jost font-bold text-[#f056f0] whitespace-nowrap">{r.receiptNumber}</td>
                            <td className="px-5 py-4 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">
                              {r.student?.firstName} {r.student?.lastName}
                            </td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">{r.classLevel}</td>
                            <td className="px-5 py-4 font-jost font-bold text-gray-800 whitespace-nowrap">{fmt(r.amount)}</td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500 capitalize whitespace-nowrap">{r.paymentMethod?.replace("_", " ")}</td>
                            <td className="px-5 py-4 font-dm-sans text-gray-400 text-xs whitespace-nowrap">{r.paymentReference || "—"}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-dm-sans font-semibold
                                ${r.status === "issued" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                {r.status === "issued" ? "Issued" : "Void"}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">{fmtDate(r.issuedAt)}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => navigate(`/admin/receipts/${r._id}`)}
                                  title="View"
                                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
                                  <FaEye className="text-xs" />
                                </button>
                                <button onClick={() => handleDownload(r)}
                                  title="Download PDF" disabled={downloadingId === r._id}
                                  className="p-2 bg-[#f056f0]/10 hover:bg-[#f056f0]/20 text-[#f056f0] rounded-full transition-colors disabled:opacity-50">
                                  {downloadingId === r._id
                                    ? <span className="w-3 h-3 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin block" />
                                    : <FaDownload className="text-xs" />}
                                </button>
                                <button onClick={() => handlePrint(r)}
                                  title="Print"
                                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-500 rounded-full transition-colors">
                                  <FaPrint className="text-xs" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-dm-sans text-xs text-gray-400">
                      Showing {receipts.length} of {pagination.total} receipts
                    </p>
                    <div className="flex items-center gap-2">
                      <button disabled={pagination.page <= 1} onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">Previous</button>
                      <span className="font-dm-sans text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
                      <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">Next</button>
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