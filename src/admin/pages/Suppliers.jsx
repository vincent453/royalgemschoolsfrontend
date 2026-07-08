import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../services/inventoryApi";

const EMPTY = { companyName:"", contactPerson:"", phone:"", email:"", address:"", notes:"" };

export default function Suppliers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const load = () => {
    setLoading(true);
    getSuppliers().then(setSuppliers).catch(e => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ companyName:s.companyName, contactPerson:s.contactPerson, phone:s.phone, email:s.email, address:s.address, notes:s.notes }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await updateSupplier(editing._id, form); showToast("success","Supplier updated."); }
      else { await createSupplier(form); showToast("success","Supplier added."); }
      setModalOpen(false); load();
    } catch(err) { showToast("error", err.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try { await deleteSupplier(deleteTarget._id); showToast("success","Supplier deleted."); setDeleteTarget(null); load(); }
    catch(err) { showToast("error", err.message); setDeleteTarget(null); }
    finally { setDeleting(false); }
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <p className="font-dm-sans text-sm text-gray-400">Inventory</p>
                <h1 className="font-jost font-bold text-gray-800 text-2xl mt-1">Suppliers</h1>
              </div>
              <button onClick={openAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm font-semibold rounded-full transition-colors">
                <FaPlus className="text-xs" /> Add Supplier
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                  <span className="font-dm-sans text-sm">Loading…</span>
                </div>
              ) : suppliers.length === 0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No suppliers added yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Company","Contact Person","Phone","Email","Address",""].map(h=>(
                          <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {suppliers.map(s=>(
                        <tr key={s._id} className="hover:bg-[#fdf8ff] transition-colors">
                          <td className="px-5 py-4 font-dm-sans font-semibold text-gray-700 whitespace-nowrap">{s.companyName}</td>
                          <td className="px-5 py-4 font-dm-sans text-gray-500">{s.contactPerson||"—"}</td>
                          <td className="px-5 py-4 font-dm-sans text-gray-500">{s.phone||"—"}</td>
                          <td className="px-5 py-4 font-dm-sans text-gray-500">{s.email||"—"}</td>
                          <td className="px-5 py-4 font-dm-sans text-gray-500 max-w-[180px] truncate">{s.address||"—"}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={()=>openEdit(s)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full transition-colors"><FaEdit className="text-xs" /></button>
                              <button onClick={()=>setDeleteTarget(s)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-colors"><FaTrash className="text-xs" /></button>
                            </div>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="font-jost font-bold text-gray-800 text-lg mb-5">{editing?"Edit Supplier":"Add Supplier"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Company Name *</label>
                <input required value={form.companyName} onChange={e=>setForm(p=>({...p,companyName:e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Contact Person</label>
                <input value={form.contactPerson} onChange={e=>setForm(p=>({...p,contactPerson:e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <input value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Notes</label>
                <textarea rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className={inputCls+" resize-none"} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-5 py-2.5 rounded-full border border-gray-200 font-dm-sans text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-[#f056f0] hover:bg-[#525fe1] text-white font-dm-sans text-sm font-semibold transition-colors disabled:opacity-50">{saving?"Saving…":editing?"Save Changes":"Add Supplier"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-jost font-bold text-gray-800 text-lg mb-2">Delete Supplier</h3>
            <p className="font-dm-sans text-sm text-gray-500 mb-6">Delete <strong>{deleteTarget.companyName}</strong>? This will fail if the supplier is linked to any inventory items.</p>
            <div className="flex justify-end gap-3">
              <button onClick={()=>setDeleteTarget(null)} className="px-5 py-2.5 rounded-full border border-gray-200 font-dm-sans text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-6 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-dm-sans text-sm font-semibold disabled:opacity-50">{deleting?"Deleting…":"Delete"}</button>
            </div>
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