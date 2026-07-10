import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaExclamationTriangle } from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { getLowStock, getOutOfStock } from "../../services/inventoryApi";

const fmt = (n) => `₦${Number(n||0).toLocaleString("en-NG",{minimumFractionDigits:2})}`;

const StatusBadge = ({ status }) => {
  const m = {"Low Stock":"bg-amber-100 text-amber-700","Out of Stock":"bg-red-100 text-red-600"};
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m[status]??"bg-gray-100 text-gray-500"}`}>{status}</span>;
};

export default function LowStock() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowItems, setLowItems] = useState([]);
  const [outItems, setOutItems] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [tab,      setTab]      = useState("low");

  useEffect(() => {
    setLoading(true);
    Promise.all([getLowStock(), getOutOfStock()])
      .then(([low, out]) => { setLowItems(low); setOutItems(out); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const items = tab === "low" ? lowItems : outItems;

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p=>!p)} /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
        <main className="w-full overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="font-dm-sans text-sm text-gray-400">Inventory / Reports</p>
              <h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Stock Alerts</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">Items that need restocking attention.</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            {!loading && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key:"low", label:"Low Stock",    count:lowItems.length, color:"amber", icon:"text-amber-500" },
                  { key:"out", label:"Out of Stock",  count:outItems.length, color:"red",   icon:"text-red-500"   },
                ].map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`rounded-2xl p-5 flex items-center gap-4 border-2 transition-all text-left
                      ${tab===t.key ? `border-${t.color}-400 bg-${t.color}-50` : "border-gray-100 bg-white hover:border-gray-200"}`}>
                    <div className={`w-12 h-12 rounded-xl bg-${t.color}-100 flex items-center justify-center shrink-0`}>
                      <FaExclamationTriangle className={`${t.icon} text-xl`} />
                    </div>
                    <div>
                      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{t.label}</p>
                      <p className={`font-jost font-bold text-2xl text-${t.color}-600 mt-0.5`}>{t.count}</p>
                      <p className="font-dm-sans text-xs text-gray-400">{t.key==="low"?"Items below minimum":"Items with zero quantity"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-jost font-bold text-gray-800">{tab==="low"?"Low Stock Items":"Out of Stock Items"}</h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                  <span className="font-dm-sans text-sm">Loading…</span>
                </div>
              ) : items.length === 0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">All good — no alerts!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Code","Name","Category","Qty","Min","Status","Supplier","Value",""].map(h=>(
                          <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {items.map(item=>(
                        <tr key={item._id} className="hover:bg-[#fdf8ff] transition-colors">
                          <td className="px-5 py-4 font-jost font-bold text-[#f056f0] whitespace-nowrap">{item.itemCode}</td>
                          <td className="px-5 py-4 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">{item.itemName}</td>
                          <td className="px-5 py-4 font-dm-sans text-gray-500">{item.category}</td>
                          <td className={`px-5 py-4 font-jost font-bold ${item.quantity===0?"text-red-500":"text-amber-600"}`}>
                            {item.quantity} <span className="font-dm-sans text-xs text-gray-400 font-normal">{item.unit}</span>
                          </td>
                          <td className="px-5 py-4 font-dm-sans text-gray-500">{item.minimumStock}</td>
                          <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                          <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">{item.supplier?.companyName??"—"}</td>
                          <td className="px-5 py-4 font-dm-sans text-gray-700">{fmt(item.quantity*item.purchasePrice)}</td>
                          <td className="px-5 py-4">
                            <button onClick={()=>navigate(`/admin/inventory/items/${item._id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200
                                         text-gray-600 text-xs font-dm-sans font-semibold rounded-full transition-colors">
                              <FaEye className="text-xs" /> View
                            </button>
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
    </div>
  );
}