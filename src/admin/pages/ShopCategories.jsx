import { useState, useEffect, useRef } from "react";
import { FaPlus, FaEdit, FaTrash, FaTags, FaTimes, FaSave } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/shopApi";

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
    ))}
  </div>
);

export default function ShopCategories() {
  const hasFetched    = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState(null);

  // Modal state
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create
  const [saving,     setSaving]     = useState(false);
  const [name,       setName]       = useState("");
  const [description,setDescription]= useState("");
  const [sortOrder,  setSortOrder]  = useState(0);
  const [imageFile,  setImageFile]  = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setName(""); setDescription(""); setSortOrder(0);
    setImageFile(null); setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setName(cat.name); setDescription(cat.description ?? ""); setSortOrder(cat.sortOrder ?? 0);
    setImageFile(null); setImagePreview(cat.image ?? null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) { showToast("error", "Category name is required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",        name.trim());
      fd.append("description", description.trim());
      fd.append("sortOrder",   sortOrder);
      if (imageFile) fd.append("image", imageFile);

      if (editTarget) {
        const updated = await updateCategory(editTarget._id, fd);
        setCategories(prev => prev.map(c => c._id === updated._id ? updated : c));
        showToast("success", "Category updated.");
      } else {
        const created = await createCategory(fd);
        setCategories(prev => [...prev, created]);
        showToast("success", "Category created.");
      }
      closeModal();
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await deleteCategory(cat._id);
      setCategories(prev => prev.filter(c => c._id !== cat._id));
      showToast("success", "Category deleted.");
    } catch (e) {
      showToast("error", e.message);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
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
          <div className="max-w-5xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-2xl text-gray-800">Categories</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
                </p>
              </div>
              <button onClick={openCreate}
                className="flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                           px-5 py-2.5 rounded-full font-jost font-semibold text-sm transition-colors shadow-sm">
                <FaPlus className="text-xs" /> Add Category
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
                {error}
              </div>
            )}

            {/* Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? <Skeleton /> : categories.length === 0 ? (
                <div className="py-20 text-center">
                  <FaTags className="text-4xl text-gray-200 mx-auto mb-3" />
                  <p className="font-dm-sans text-sm text-gray-400">No categories yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {categories.map(cat => (
                    <div key={cat._id}
                      className="border border-gray-100 rounded-2xl p-4 hover:border-[#f056f0]/30
                                 hover:shadow-sm transition-all duration-200 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                              <FaTags className="text-[#f056f0] text-sm" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-dm-sans font-bold text-gray-700 text-sm truncate">{cat.name}</p>
                            <p className="font-dm-sans text-xs text-gray-400 truncate">/{cat.slug}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(cat)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400
                                       hover:bg-[#f056f0]/10 hover:text-[#f056f0] transition-colors">
                            <FaEdit className="text-xs" />
                          </button>
                          <button onClick={() => handleDelete(cat)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400
                                       hover:bg-red-50 hover:text-red-500 transition-colors">
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {cat.description && (
                        <p className="font-dm-sans text-xs text-gray-400 mt-2 line-clamp-2">{cat.description}</p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-dm-sans
                          ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="font-dm-sans text-[10px] text-gray-400">Sort: {cat.sortOrder ?? 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-jost font-bold text-gray-800">
                {editTarget ? "Edit Category" : "New Category"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex-shrink-0
                                flex items-center justify-center bg-gray-50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FaTags className="text-2xl text-gray-300" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="font-dm-sans text-sm text-[#f056f0] hover:underline">
                    {imagePreview ? "Change image" : "Upload image"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                  Name *
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Uniforms"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                             text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors" />
              </div>

              <div>
                <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                  Description
                </label>
                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                             text-gray-700 focus:outline-none focus:border-[#f056f0] resize-none transition-colors" />
              </div>

              <div>
                <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                  Sort Order
                </label>
                <input type="number" min={0} value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                             text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors" />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={closeModal}
                className="px-6 py-2.5 rounded-full border border-gray-300 font-dm-sans text-sm text-gray-600
                           hover:border-[#f056f0] hover:text-[#f056f0] transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-dm-sans text-sm font-semibold
                            text-white transition-colors
                            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><FaSave className="text-xs" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}