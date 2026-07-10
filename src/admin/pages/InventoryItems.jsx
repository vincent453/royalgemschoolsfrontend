import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { getInventory, deleteInventoryItem, getSuppliers, createInventoryItem, updateInventoryItem } from "../../services/inventoryApi";

const CATEGORIES = ["Books","Uniforms","Stationery","Laboratory Equipment","Computers","Printers","Projectors","Furniture","Sports Equipment","Cleaning Materials","Office Supplies","Other"];
const STATUSES   = ["In Stock","Low Stock","Out of Stock"];
const EMPTY_FORM = { itemName:"", category:"Books", description:"", unit:"piece", quantity:0, minimumStock:5, purchasePrice:0, sellingPrice:0, location:"", supplier:"" };

const StatusBadge = ({ status }) => {
  const m = {"In Stock":"bg-emerald-100 text-emerald-700","Low Stock":"bg-amber-100 text-amber-700","Out of Stock":"bg-red-100 text-red-600"};
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m[status]??"bg-gray-100 text-gray-500"}`}>{status}</span>;
};

export default function InventoryItems() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [items,        setItems]        = useState([]);
  const [pagination,   setPagination]   = useState({ page:1, totalPages:1, total:0 });
  const [suppliers,    setSuppliers]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("");
  const [status,       setStatus]       = useState(searchParams.get("status")||"");
  const [page,         setPage]         = useState(1);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(()=>setToast(null), 3500); };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getInventory({ search, category, status, page, limit:15 });
      setItems(data.items??[]); setPagination(data.pagination??{page:1,totalPages:1,total:0});
    } catch(e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { getSuppliers().then(setSuppliers).catch(()=>{}); }, []);
  useEffect(() => { load(); }, [search, category, status, page]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ itemName:item.itemName, category:item.category, description:item.description, unit:item.unit, quantity:item.quantity, minimumStock:item.minimumStock, purchasePrice:item.purchasePrice, sellingPrice:item.sellingPrice, location:item.location, supplier:item.supplier?._id??"" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, supplier:form.supplier||undefined };
      if (editing) { await updateInventoryItem(editing._id, payload); showToast("success","Item updated."); }
      else { await createInventoryItem(payload); showToast("success","Item added."); }
      setModalOpen(false); load();
    } catch(e) { showToast("error", e.message); } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try { await deleteInventoryItem(deleteTarget._id); showToast("success","Item deleted."); setDeleteTarget(null); load(); }
    catch(e) { showToast("error", e.message); setDeleteTarget(null); } finally { setDeleting(false); }
  };

  const ic = "border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors w-full";
  const lc = "font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide block mb-1";

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={()=>setSidebarOpen(p=>!p)} /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div><p className="font-dm-sans text-sm text-gray-400">Inventory</p><h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Inventory Items</h1></div>
              <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm font-semibold rounded-full transition-colors">
                <FaPlus className="text-xs" /> Add Item
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search name, code…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors" />
              </div>
              <select value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}} className={ic+" w-auto"}>
                <option value="">All Categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
              <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className={ic+" w-auto"}>
                <option value="">All Status</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                  <span className="font-dm-sans text-sm">Loading…</span>
                </div>
              ) : items.length===0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No inventory items found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>{["Code","Name","Category","Qty","Min Stock","Status","Supplier",""].map(h=>(
                          <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map(item=>(
                          <tr key={item._id} className="hover:bg-[#fdf8ff] transition-colors">
                            <td className="px-5 py-4 font-jost font-bold text-[#f056f0] whitespace-nowrap">{item.itemCode}</td>
                            <td className="px-5 py-4 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">{item.itemName}</td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">{item.category}</td>
                            <td className="px-5 py-4 font-jost font-bold text-gray-800">{item.quantity} <span className="font-dm-sans text-xs text-gray-400">{item.unit}</span></td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500">{item.minimumStock}</td>
                            <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                            <td className="px-5 py-4 font-dm-sans text-gray-500 whitespace-nowrap">{item.supplier?.companyName??"—"}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={()=>navigate(`/admin/inventory/items/${item._id}`)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"><FaEye className="text-xs" /></button>
                                <button onClick={()=>openEdit(item)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full transition-colors"><FaEdit className="text-xs" /></button>
                                <button onClick={()=>setDeleteTarget(item)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-colors"><FaTrash className="text-xs" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="font-dm-sans text-xs text-gray-400">Showing {items.length} of {pagination.total}</p>
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
            <h3 className="font-jost font-bold text-gray-800 text-lg mb-5">{editing?"Edit Item":"Add Inventory Item"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className={lc}>Item Name *</label><input required value={form.itemName} onChange={e=>setForm(p=>({...p,itemName:e.target.value}))} className={ic} placeholder="e.g. Chemistry Textbook" /></div>
              <div><label className={lc}>Category *</label><select required value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className={ic}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className={lc}>Unit</label><input value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} className={ic} placeholder="piece, box, set…" /></div>
              <div><label className={lc}>Quantity</label><input type="number" min="0" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} className={ic} /></div>
              <div><label className={lc}>Minimum Stock</label><input type="number" min="0" value={form.minimumStock} onChange={e=>setForm(p=>({...p,minimumStock:e.target.value}))} className={ic} /></div>
              <div><label className={lc}>Purchase Price (₦)</label><input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={e=>setForm(p=>({...p,purchasePrice:e.target.value}))} className={ic} /></div>
              <div><label className={lc}>Selling Price (₦)</label><input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={e=>setForm(p=>({...p,sellingPrice:e.target.value}))} className={ic} /></div>
              <div><label className={lc}>Supplier</label><select value={form.supplier} onChange={e=>setForm(p=>({...p,supplier:e.target.value}))} className={ic}><option value="">No supplier</option>{suppliers.map(s=><option key={s._id} value={s._id}>{s.companyName}</option>)}</select></div>
              <div><label className={lc}>Location</label><input value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} className={ic} placeholder="e.g. Store Room A" /></div>
              <div className="sm:col-span-2"><label className={lc}>Description</label><textarea rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className={ic+" resize-none"} /></div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-5 py-2.5 rounded-full border border-gray-200 font-dm-sans text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm font-semibold transition-colors disabled:opacity-50">{saving?"Saving…":editing?"Save Changes":"Add Item"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-jost font-bold text-gray-800 text-lg mb-2">Delete Item</h3>
            <p className="font-dm-sans text-sm text-gray-500 mb-6">Delete <strong>{deleteTarget.itemName}</strong>? This will fail if transaction history exists.</p>
            <div className="flex justify-end gap-3">
              <button onClick={()=>setDeleteTarget(null)} className="px-5 py-2.5 rounded-full border border-gray-200 font-dm-sans text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-6 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-dm-sans text-sm font-semibold disabled:opacity-50">{deleting?"Deleting…":"Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold ${toast.type==="success"?"bg-emerald-500 text-white":"bg-red-500 text-white"}`}>{toast.msg}</div>}
    </div>
  );
}