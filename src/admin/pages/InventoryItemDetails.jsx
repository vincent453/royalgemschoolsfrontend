import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { getInventoryItem, stockIn, stockOut, adjustStock } from "../../services/inventoryApi";

const fmt     = (n) => `₦${Number(n||0).toLocaleString("en-NG",{minimumFractionDigits:2})}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";

const StatusBadge = ({ status }) => {
  const m = {"In Stock":"bg-emerald-100 text-emerald-700","Low Stock":"bg-amber-100 text-amber-700","Out of Stock":"bg-red-100 text-red-600"};
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${m[status]??"bg-gray-100 text-gray-500"}`}>{status}</span>;
};

const MoveBadge = ({ type }) => {
  const m = {"Stock In":"bg-emerald-100 text-emerald-700","Stock Out":"bg-red-100 text-red-600","Adjustment":"bg-blue-100 text-blue-700","Damaged":"bg-orange-100 text-orange-700","Lost":"bg-gray-100 text-gray-600","Returned":"bg-purple-100 text-purple-700","Transferred":"bg-indigo-100 text-indigo-700"};
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m[type]??"bg-gray-100 text-gray-500"}`}>{type}</span>;
};

const MOVE_TYPES = ["Stock In","Stock Out","Adjustment","Damaged","Lost","Returned","Transferred"];

export default function InventoryItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [moveModal, setMoveModal] = useState(false);
  const [moveForm,  setMoveForm]  = useState({ type:"Stock In", quantity:"", reason:"", reference:"" });
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const load = () => {
    setLoading(true);
    getInventoryItem(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleMove = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { inventoryId: id, quantity: Number(moveForm.quantity), reason: moveForm.reason, reference: moveForm.reference };
      if (moveForm.type === "Stock In")                           await stockIn(payload);
      else if (moveForm.type === "Stock Out")                     await stockOut(payload);
      else await adjustStock({ ...payload, type: moveForm.type });
      showToast("success", "Stock movement recorded.");
      setMoveModal(false);
      load();
    } catch (err) { showToast("error", err.message); }
    finally { setSaving(false); }
  };

  const inputCls = "border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors w-full";
  const labelCls = "font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide block mb-1";

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p=>!p)} /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
        <main className="w-full overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 space-y-6">

            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-dm-sans text-sm text-gray-500 hover:text-[#f056f0] transition-colors">
                <FiArrowLeft /> Back
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                <span className="w-6 h-6 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                <span className="font-dm-sans text-sm">Loading…</span>
              </div>
            ) : data && (
              <>
                {/* Header card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-jost font-black text-[#f056f0] text-lg">{data.item.itemCode}</p>
                      <StatusBadge status={data.item.status} />
                    </div>
                    <h1 className="font-jost font-bold text-gray-800 text-2xl">{data.item.itemName}</h1>
                    <p className="font-dm-sans text-sm text-gray-400 mt-1">{data.item.category} · {data.item.location || "No location set"}</p>
                    {data.item.description && <p className="font-dm-sans text-sm text-gray-500 mt-2">{data.item.description}</p>}
                  </div>
                  <div className="flex gap-3 shrink-0 items-start">
                    <button onClick={() => setMoveModal(true)}
                      className="px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm font-semibold rounded-full transition-colors">
                      Record Movement
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label:"Current Stock",    value:`${data.item.quantity} ${data.item.unit}` },
                    { label:"Minimum Stock",    value:data.item.minimumStock },
                    { label:"Purchase Price",   value:fmt(data.item.purchasePrice) },
                    { label:"Inventory Value",  value:fmt(data.item.quantity * data.item.purchasePrice) },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
                      <p className="font-jost font-bold text-xl text-gray-800 mt-1">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Supplier */}
                {data.item.supplier && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-jost font-bold text-gray-800 mb-3">Supplier</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label:"Company",  value:data.item.supplier.companyName },
                        { label:"Contact",  value:data.item.supplier.contactPerson },
                        { label:"Phone",    value:data.item.supplier.phone },
                        { label:"Email",    value:data.item.supplier.email },
                        { label:"Address",  value:data.item.supplier.address },
                      ].filter(r=>r.value).map(r => (
                        <div key={r.label}>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{r.label}</p>
                          <p className="font-dm-sans font-semibold text-gray-700 mt-0.5">{r.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock movements */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-jost font-bold text-gray-800">Stock Movement History</h2>
                  </div>
                  {data.movements.length === 0 ? (
                    <div className="py-10 text-center font-dm-sans text-sm text-gray-400">No movements recorded yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            {["Date","Type","Qty","Before","After","Reason","Reference"].map(h=>(
                              <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {data.movements.map(m=>(
                            <tr key={m._id} className="hover:bg-[#fdf8ff] transition-colors">
                              <td className="px-5 py-3 font-dm-sans text-gray-500 whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                              <td className="px-5 py-3"><MoveBadge type={m.type} /></td>
                              <td className="px-5 py-3 font-jost font-bold text-gray-800">{m.quantity}</td>
                              <td className="px-5 py-3 font-dm-sans text-gray-500">{m.quantityBefore}</td>
                              <td className="px-5 py-3 font-dm-sans font-semibold text-gray-700">{m.quantityAfter}</td>
                              <td className="px-5 py-3 font-dm-sans text-gray-500">{m.reason||"—"}</td>
                              <td className="px-5 py-3 font-dm-sans text-gray-400 text-xs">{m.reference||"—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Purchase history */}
                {data.purchases.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h2 className="font-jost font-bold text-gray-800">Purchase History</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            {["Date","Invoice","Supplier","Qty","Unit Price","Total"].map(h=>(
                              <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {data.purchases.map(p=>{
                            const line = p.items.find(i=>String(i.inventory)===id||String(i.inventory?._id)===id);
                            return (
                              <tr key={p._id} className="hover:bg-[#fdf8ff] transition-colors">
                                <td className="px-5 py-3 font-dm-sans text-gray-500 whitespace-nowrap">{fmtDate(p.purchaseDate)}</td>
                                <td className="px-5 py-3 font-dm-sans text-gray-600">{p.invoiceNumber||"—"}</td>
                                <td className="px-5 py-3 font-dm-sans text-gray-600">{p.supplier?.companyName||"—"}</td>
                                <td className="px-5 py-3 font-dm-sans text-gray-700">{line?.quantity??"—"}</td>
                                <td className="px-5 py-3 font-dm-sans text-gray-700">{line?fmt(line.unitPrice):"—"}</td>
                                <td className="px-5 py-3 font-jost font-bold text-gray-800">{line?fmt(line.totalCost):"—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Move modal */}
      {moveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-jost font-bold text-gray-800 text-lg mb-5">Record Stock Movement</h3>
            <form onSubmit={handleMove} className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Movement Type</label>
                <select value={moveForm.type} onChange={e=>setMoveForm(p=>({...p,type:e.target.value}))} className={inputCls}>
                  {MOVE_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Quantity *</label>
                <input required type="number" min="1" value={moveForm.quantity}
                  onChange={e=>setMoveForm(p=>({...p,quantity:e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Reason</label>
                <input value={moveForm.reason} onChange={e=>setMoveForm(p=>({...p,reason:e.target.value}))} className={inputCls} placeholder="Optional reason" />
              </div>
              <div>
                <label className={labelCls}>Reference</label>
                <input value={moveForm.reference} onChange={e=>setMoveForm(p=>({...p,reference:e.target.value}))} className={inputCls} placeholder="e.g. invoice no." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setMoveModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 font-dm-sans text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm font-semibold transition-colors disabled:opacity-50">
                  {saving?"Saving…":"Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold
          ${toast.type==="success"?"bg-emerald-500 text-white":"bg-red-500 text-white"}`}>{toast.msg}</div>
      )}
    </div>
  );
}