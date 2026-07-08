import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { getPurchases, recordPurchase, getInventory, getSuppliers } from "../../services/inventoryApi";

const fmt = (n) => `₦${Number(n||0).toLocaleString("en-NG",{minimumFractionDigits:2})}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";

const EMPTY_LINE = { inventoryId:"", itemName:"", quantity:1, unitPrice:0 };

export default function Purchases() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState({ page:1, totalPages:1, total:0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [page,    setPage]    = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [allItems,  setAllItems]  = useState([]);
  const [form, setForm] = useState({ supplierId:"", invoiceNumber:"", purchaseDate:"", notes:"", lines:[{ ...EMPTY_LINE }] });

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(()=>setToast(null), 3500); };

  const load = () => {
    setLoading(true);
    getPurchases({ page, limit:15 })
      .then(d => { setPurchases(d.purchases??[]); setPagination(d.pagination??{ page:1,totalPages:1,total:0 }); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => {
    getSuppliers().then(setSuppliers).catch(()=>{});
    getInventory({ limit:200 }).then(d=>setAllItems(d.items??[])).catch(()=>{});
  }, []);

  const addLine = () => setForm(p=>({ ...p, lines:[...p.lines,{ ...EMPTY_LINE }] }));
  const removeLine = (i) => setForm(p=>({ ...p, lines:p.lines.filter((_,idx)=>idx!==i) }));
  const updateLine = (i, field, val) => setForm(p=>({
    ...p,
    lines: p.lines.map((l,idx) => {
      if (idx!==i) return l;
      const updated = { ...l, [field]:val };
      if (field==="inventoryId") {
        const inv = allItems.find(it=>it._id===val);
        updated.itemName   = inv?.itemName ?? "";
        updated.unitPrice  = inv?.purchasePrice ?? 0;
      }
      return updated;
    }),
  }));

  const total = form.lines.reduce((s,l)=>s+(Number(l.quantity)||0)*(Number(l.unitPrice)||0),0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const items = form.lines.map(l=>({ inventoryId:l.inventoryId, quantity:Number(l.quantity), unitPrice:Number(l.unitPrice) }));
      await recordPurchase({ supplierId:form.supplierId||undefined, invoiceNumber:form.invoiceNumber, purchaseDate:form.purchaseDate||undefined, notes:form.notes, items });
      showToast("success","Purchase recorded and inventory updated.");
      setModalOpen(false);
      setForm({ supplierId:"", invoiceNumber:"", purchaseDate:"", notes:"", lines:[{...EMPTY_LINE}] });
      load();
    } catch(err) { showToast("error", err.message); }
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
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <p className="font-dm-sans text-sm text-gray-400">Inventory</p>
                <h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Purchase Records</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-1">Every purchase automatically updates inventory and creates an expense entry.</p>
              </div>
              <button onClick={()=>setModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm font-semibold rounded-full transition-colors">
                <FaPlus className="text-xs" /> Record Purchase
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                  <span className="font-dm-sans text-sm">Loading…</span>
                </div>
              ) : purchases.length === 0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No purchases recorded yet.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {["Date","Invoice","Supplier","Items","Total","Purchased By"].map(h=>(
                            <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {purchases.map(p=>(
                          <tr key={p._id} className="hover:bg-[#fdf8ff] transition-colors">
                            <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">{fmtDate(p.purchaseDate)}</td>
                            <td className="px-5 py-4 font-dm-sans text-gray-600">{p.invoiceNumber||"—"}</td>
                            <td className="px-5 py-4 font-dm-sans text-gray-600">{p.supplier?.companyName||"—"}</td>
                            <td className="px-5 py-4 font-dm-sans text-gray-600">{p.items.length} item{p.items.length!==1?"s":""}</td>
                            <td className="px-5 py-4 font-jost font-bold text-gray-800">{fmt(p.totalAmount)}</td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500">{p.purchasedBy?.name||"—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="font-dm-sans text-xs text-gray-400">Showing {purchases.length} of {pagination.total} purchases</p>
                    <div className="flex items-center gap-2">
                      <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">Previous</button>
                      <span className="font-dm-sans text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
                      <button disabled={page>=pagination.totalPages} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans font-semibold text-gray-600 disabled:opacity-40 hover:border-[#f056f0] transition-colors">Next</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-jost font-bold text-gray-800 text-lg mb-5">Record Purchase</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Supplier</label>
                  <select value={form.supplierId} onChange={e=>setForm(p=>({...p,supplierId:e.target.value}))} className={inputCls}>
                    <option value="">No supplier</option>
                    {suppliers.map(s=><option key={s._id} value={s._id}>{s.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Invoice Number</label>
                  <input value={form.invoiceNumber} onChange={e=>setForm(p=>({...p,invoiceNumber:e.target.value}))} className={inputCls} placeholder="INV-001" />
                </div>
                <div>
                  <label className={labelCls}>Purchase Date</label>
                  <input type="date" value={form.purchaseDate} onChange={e=>setForm(p=>({...p,purchaseDate:e.target.value}))} className={inputCls} />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Items *</label>
                  <button type="button" onClick={addLine} className="text-xs font-dm-sans font-semibold text-[#f056f0] hover:underline">+ Add line</button>
                </div>
                <div className="space-y-2">
                  {form.lines.map((l,i)=>(
                    <div key={i} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center">
                      <select value={l.inventoryId} onChange={e=>updateLine(i,"inventoryId",e.target.value)} required className={inputCls}>
                        <option value="">Select item</option>
                        {allItems.map(it=><option key={it._id} value={it._id}>{it.itemName}</option>)}
                      </select>
                      <input type="number" min="1" value={l.quantity} onChange={e=>updateLine(i,"quantity",e.target.value)} className={inputCls} placeholder="Qty" />
                      <input type="number" min="0" step="0.01" value={l.unitPrice} onChange={e=>updateLine(i,"unitPrice",e.target.value)} className={inputCls} placeholder="Price" />
                      <button type="button" onClick={()=>removeLine(i)} disabled={form.lines.length===1}
                        className="text-red-400 hover:text-red-600 font-bold text-lg leading-none disabled:opacity-30">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className={inputCls+" resize-none"} />
              </div>

              <div className="bg-[#f056f0] rounded-2xl px-5 py-3 flex items-center justify-between text-white">
                <span className="font-dm-sans text-sm">Total Amount</span>
                <span className="font-jost font-bold text-xl">{fmt(total)}</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-5 py-2.5 rounded-full border border-gray-200 font-dm-sans text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm font-semibold transition-colors disabled:opacity-50">{saving?"Recording…":"Record Purchase"}</button>
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