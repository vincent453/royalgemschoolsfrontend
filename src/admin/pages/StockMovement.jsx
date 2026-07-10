import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { getInventory } from "../../services/inventoryApi";

const API = "https://royalgemschoolsbackend.vercel.app";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const PAGE = 15;

const MoveBadge = ({ type }) => {
  const m = {
    "Stock In":    "bg-emerald-100 text-emerald-700",
    "Stock Out":   "bg-red-100 text-red-600",
    "Adjustment":  "bg-blue-100 text-blue-700",
    "Damaged":     "bg-orange-100 text-orange-700",
    "Lost":        "bg-gray-100 text-gray-600",
    "Returned":    "bg-purple-100 text-purple-700",
    "Transferred": "bg-indigo-100 text-indigo-700",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m[type]??"bg-gray-100 text-gray-500"}`}>{type}</span>;
};

const TYPES = ["","Stock In","Stock Out","Adjustment","Damaged","Lost","Returned","Transferred"];

export default function StockMovements() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [movements, setMovements] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Fetch all movements via the admin endpoint
    const token = localStorage.getItem("token");
    setLoading(true);
    fetch(`${API}/api/inventory/report`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        // recentMovements from report — for full list fetch each item's movements
        // Since we don't have a standalone /movements endpoint, we load from report
        setMovements(Array.isArray(data.recentMovements) ? data.recentMovements : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = movements;
    if (typeFilter) list = list.filter(m => m.type === typeFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(m =>
      m.inventory?.itemName?.toLowerCase().includes(q) ||
      m.inventory?.itemCode?.toLowerCase().includes(q) ||
      m.itemName?.toLowerCase().includes(q) ||
      m.reason?.toLowerCase().includes(q) ||
      m.reference?.toLowerCase().includes(q)
    );
    return list;
  }, [movements, typeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pageData   = filtered.slice((page-1)*PAGE, page*PAGE);

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p=>!p)} /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="font-dm-sans text-sm text-gray-400">Inventory</p>
              <h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Stock Movements</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">
                Track every stock change across all inventory items.
              </p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}
                  placeholder="Search item name, code, reason…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-dm-sans text-sm
                             text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors" />
              </div>
              <select value={typeFilter} onChange={e=>{ setTypeFilter(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                           focus:outline-none focus:border-[#f056f0] bg-white transition-colors">
                {TYPES.map(t => <option key={t} value={t}>{t || "All Types"}</option>)}
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                  <span className="font-dm-sans text-sm">Loading movements…</span>
                </div>
              ) : pageData.length === 0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No stock movements found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {["Date","Item","Code","Type","Change","Before","After","Reason","Reference"].map(h => (
                            <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pageData.map(m => (
                          <tr key={m._id} className="hover:bg-[#fdf8ff] transition-colors">
                            <td className="px-5 py-3 font-dm-sans text-gray-500 whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                            <td className="px-5 py-3 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">
                              {m.inventory?.itemName ?? m.itemName ?? "—"}
                            </td>
                            <td className="px-5 py-3 font-jost font-bold text-[#f056f0] text-xs whitespace-nowrap">
                              {m.inventory?.itemCode ?? "—"}
                            </td>
                            <td className="px-5 py-3"><MoveBadge type={m.type} /></td>
                            <td className={`px-5 py-3 font-jost font-bold whitespace-nowrap
                              ${m.type === "Stock In" || m.type === "Returned" ? "text-emerald-600" : "text-red-500"}`}>
                              {m.type === "Stock In" || m.type === "Returned" ? "+" : "-"}{m.quantity}
                            </td>
                            <td className="px-5 py-3 font-dm-sans text-gray-500">{m.quantityBefore}</td>
                            <td className="px-5 py-3 font-dm-sans font-semibold text-gray-700">{m.quantityAfter}</td>
                            <td className="px-5 py-3 font-dm-sans text-gray-400 text-xs max-w-[140px] truncate">{m.reason || "—"}</td>
                            <td className="px-5 py-3 font-dm-sans text-gray-400 text-xs whitespace-nowrap">{m.reference || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-dm-sans text-xs text-gray-400">
                      Showing {pageData.length} of {filtered.length} movements
                    </p>
                    <div className="flex items-center gap-2">
                      <button disabled={page<=1} onClick={() => setPage(p=>p-1)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">Previous</button>
                      <span className="font-dm-sans text-xs text-gray-500">Page {page} of {totalPages}</span>
                      <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)}
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