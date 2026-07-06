import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxes, FaExclamationTriangle, FaTimesCircle, FaShoppingCart } from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { getInventoryReport } from "../../services/inventoryApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const StatCard = ({ icon, label, value, sub, color, onClick }) => (
  <button onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4
                ${onClick ? "hover:shadow-md cursor-pointer transition-shadow" : ""} text-left w-full`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-jost font-bold text-2xl text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="font-dm-sans text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </button>
);

const MovementBadge = ({ type }) => {
  const map = {
    "Stock In":    "bg-emerald-100 text-emerald-700",
    "Stock Out":   "bg-red-100 text-red-600",
    "Adjustment":  "bg-blue-100 text-blue-700",
    "Damaged":     "bg-orange-100 text-orange-700",
    "Lost":        "bg-gray-100 text-gray-600",
    "Returned":    "bg-purple-100 text-purple-700",
    "Transferred": "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[type] ?? "bg-gray-100 text-gray-500"}`}>
      {type}
    </span>
  );
};

export default function InventoryDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getInventoryReport()
      .then(setReport)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
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
              <p className="font-dm-sans text-sm text-gray-400">Inventory</p>
              <h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Inventory Dashboard</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">
                Overview of all school assets, stock levels and recent activity.
              </p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            {/* Stat cards */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
              </div>
            ) : report && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<FaBoxes className="text-[#f056f0]" />}
                  label="Total Items" value={report.totalItems}
                  sub={`Value: ${fmt(report.totalValue)}`} color="bg-pink-50"
                  onClick={() => navigate("/admin/inventory/items")} />
                <StatCard icon={<FaBoxes className="text-emerald-500" />}
                  label="In Stock" value={report.inStock} color="bg-emerald-50"
                  onClick={() => navigate("/admin/inventory/items?status=In Stock")} />
                <StatCard icon={<FaExclamationTriangle className="text-amber-500" />}
                  label="Low Stock" value={report.lowStock} color="bg-amber-50"
                  onClick={() => navigate("/admin/inventory/items?status=Low Stock")} />
                <StatCard icon={<FaTimesCircle className="text-red-500" />}
                  label="Out of Stock" value={report.outOfStock} color="bg-red-50"
                  onClick={() => navigate("/admin/inventory/items?status=Out of Stock")} />
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "All Items",      href: "/admin/inventory/items",     color: "bg-[#f056f0] text-white" },
                { label: "Suppliers",      href: "/admin/inventory/suppliers",  color: "bg-indigo-500 text-white" },
                { label: "Purchases",      href: "/admin/inventory/purchases",  color: "bg-emerald-500 text-white" },
                { label: "Stock Movement", href: "/admin/inventory/movements",  color: "bg-amber-500 text-white" },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.href)}
                  className={`${a.color} rounded-2xl p-4 font-jost font-semibold text-sm
                               hover:opacity-90 transition-opacity shadow-sm text-center`}>
                  {a.label}
                </button>
              ))}
            </div>

            {/* Recent stock movements */}
            {report?.recentMovements?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-jost font-bold text-gray-800">Recent Stock Movements</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Date","Item","Type","Qty Before","Change","Qty After"].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {report.recentMovements.map(m => (
                        <tr key={m._id} className="hover:bg-[#fdf8ff] transition-colors">
                          <td className="px-5 py-3 font-dm-sans text-gray-500 whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                          <td className="px-5 py-3 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">
                            {m.inventory?.itemName ?? m.itemName}
                            {m.inventory?.itemCode && <span className="text-xs text-gray-400 ml-1">({m.inventory.itemCode})</span>}
                          </td>
                          <td className="px-5 py-3"><MovementBadge type={m.type} /></td>
                          <td className="px-5 py-3 font-dm-sans text-gray-600">{m.quantityBefore}</td>
                          <td className={`px-5 py-3 font-jost font-bold
                            ${m.type === "Stock In" || m.type === "Returned" ? "text-emerald-600" : "text-red-500"}`}>
                            {m.type === "Stock In" || m.type === "Returned" ? "+" : "-"}{m.quantity}
                          </td>
                          <td className="px-5 py-3 font-dm-sans font-semibold text-gray-700">{m.quantityAfter}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
