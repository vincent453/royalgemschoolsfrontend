import { useState, useEffect, useRef } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaExternalLinkAlt,
  FaDownload, FaTimes, FaSave, FaBookOpen, FaImage,
} from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getResources, createResource, updateResource, deleteResource } from "../../services/lmsApi";

const CLASSES = ["","JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3","Kindergarten","Nursery 1","Nursery 2"];
const CATEGORIES = [
  "Public Speaking","Programming","Culture","Financial Literacy",
  "Science & Space","Biology","Geography & World Knowledge",
  "Art, Creativity & Design","General Knowledge","Bible Knowledge & Christian Character",
];

const Skeleton = ({ n = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
    ))}
  </div>
);

const blankForm = {
  title: "", description: "", category: "", subject: "", classLevel: "", url: "",
};

export default function TeacherResources() {
  const hasFetched = useRef(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [resources,     setResources]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [toast,         setToast]         = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [form,          setForm]          = useState(blankForm);
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [attachFile,    setAttachFile]    = useState(null);
  const [filterCat,     setFilterCat]     = useState("");
  const [filterClass,   setFilterClass]   = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getResources({ category: filterCat, classLevel: filterClass });
      setResources(data.resources ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(blankForm);
    setImageFile(null); setImagePreview(null); setAttachFile(null);
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({
      title:       r.title,
      description: r.description ?? "",
      category:    r.category,
      subject:     r.subject ?? "",
      classLevel:  r.classLevel ?? "",
      url:         r.url ?? "",
    });
    setImageFile(null); setImagePreview(r.image ?? null); setAttachFile(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (imageFile)  fd.append("image", imageFile);
      if (attachFile) fd.append("attachment", attachFile);

      if (editTarget) {
        const data = await updateResource(editTarget._id, fd);
        setResources(prev => prev.map(r => r._id === editTarget._id ? data.resource : r));
        showToast("success", "Resource updated.");
      } else {
        const data = await createResource(fd);
        setResources(prev => [data.resource, ...prev]);
        showToast("success", "Resource created.");
      }
      setModalOpen(false);
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteResource(id);
      setResources(prev => prev.filter(r => r._id !== id));
      showToast("success", "Resource deleted.");
    } catch (e) {
      showToast("error", e.message);
    }
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const inputClass = `w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                      text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#f056f0]
                      transition-colors bg-white`;
  const labelClass = `font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block`;

  const filtered = resources.filter(r =>
    (!filterCat   || r.category   === filterCat) &&
    (!filterClass || r.classLevel === filterClass || r.classLevel === "")
  );

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

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-2xl text-gray-800">Learning Resources</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  Add links and files for students to explore
                </p>
              </div>
              <button onClick={openCreate}
                className="flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                           px-5 py-2.5 rounded-full font-jost font-semibold text-sm transition-colors shadow-sm">
                <FaPlus className="text-xs" /> Add Resource
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className={`${inputClass} flex-1 min-w-[200px]`}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                className={`${inputClass} flex-1 min-w-[140px]`}>
                <option value="">All Classes</option>
                {CLASSES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={fetchData}
                className="px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                           font-dm-sans text-sm font-semibold transition-colors">
                Filter
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">{error}</div>
            )}

            {/* Grid */}
            {loading ? <Skeleton /> : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl py-20 text-center shadow-sm">
                <FaBookOpen className="text-4xl text-gray-200 mx-auto mb-3" />
                <p className="font-dm-sans text-sm text-gray-400">No resources yet.</p>
                <button onClick={openCreate}
                  className="mt-4 px-6 py-2 bg-[#f056f0] text-white rounded-full font-dm-sans text-sm
                             font-semibold hover:bg-[#525fe1] transition-colors">
                  Add First Resource
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(r => (
                  <div key={r._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                               hover:shadow-md transition-shadow duration-200 group">
                    {/* Thumbnail */}
                    <div className="h-36 bg-gradient-to-br from-[#f056f0]/10 to-[#525fe1]/10 relative overflow-hidden">
                      {r.image ? (
                        <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBookOpen className="text-4xl text-[#f056f0]/30" />
                        </div>
                      )}
                      {/* Action buttons overlay */}
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)}
                          className="w-7 h-7 bg-white rounded-lg flex items-center justify-center
                                     text-gray-500 hover:text-[#f056f0] shadow-sm transition-colors">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => handleDelete(r._id, r.title)}
                          className="w-7 h-7 bg-white rounded-lg flex items-center justify-center
                                     text-gray-500 hover:text-red-500 shadow-sm transition-colors">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                      {/* Category badge */}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 rounded-full
                                       font-dm-sans text-[10px] font-semibold text-gray-600 shadow-sm">
                        {r.category}
                      </span>
                    </div>

                    <div className="p-4">
                      <p className="font-dm-sans font-bold text-gray-700 text-sm line-clamp-1">{r.title}</p>
                      {r.subject && (
                        <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                          {r.subject}{r.classLevel ? ` · ${r.classLevel}` : ""}
                        </p>
                      )}
                      {r.description && (
                        <p className="font-dm-sans text-xs text-gray-500 mt-2 line-clamp-2">{r.description}</p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f056f0] text-white rounded-lg
                                       font-dm-sans text-xs font-semibold hover:bg-[#525fe1] transition-colors">
                            <FaExternalLinkAlt className="text-[10px]" /> Open Resource
                          </a>
                        )}
                        {r.attachment && (
                          <a href={r.attachment} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg
                                       font-dm-sans text-xs text-gray-600 hover:border-[#f056f0]
                                       hover:text-[#f056f0] transition-colors">
                            <FaDownload className="text-[10px]" /> Download
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-jost font-bold text-gray-800">
                {editTarget ? "Edit Resource" : "Add Resource"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
                  placeholder="e.g. Introduction to Photosynthesis" required className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select value={form.category} onChange={e => set("category", e.target.value)}
                    required className={`${inputClass} appearance-none`}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Class (optional)</label>
                  <select value={form.classLevel} onChange={e => set("classLevel", e.target.value)}
                    className={`${inputClass} appearance-none`}>
                    <option value="">All Classes</option>
                    {CLASSES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Subject</label>
                <input type="text" value={form.subject} onChange={e => set("subject", e.target.value)}
                  placeholder="e.g. Biology" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea rows={2} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Brief description of this resource..."
                  className={`${inputClass} resize-none`} />
              </div>

              <div>
                <label className={labelClass}>External Link / URL</label>
                <input type="url" value={form.url} onChange={e => set("url", e.target.value)}
                  placeholder="https://..." className={inputClass} />
                <p className="font-dm-sans text-[10px] text-gray-400 mt-1">
                  Link to a website, YouTube video, or any external resource.
                </p>
              </div>

              <div>
                <label className={labelClass}>Thumbnail Image (optional)</label>
                <div className="flex items-center gap-3">
                  {imagePreview && (
                    <img src={imagePreview} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                  )}
                  <label className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200
                                    rounded-xl hover:border-[#f056f0] transition-colors">
                      <FaImage className="text-gray-300" />
                      <span className="font-dm-sans text-sm text-gray-400">
                        {imageFile ? imageFile.name : "Choose image…"}
                      </span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Downloadable File (optional)</label>
                <input type="file"
                  accept=".pdf,.doc,.docx,image/jpeg,image/png"
                  onChange={e => setAttachFile(e.target.files[0] ?? null)}
                  className="w-full font-dm-sans text-sm text-gray-600
                             file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0
                             file:bg-[#f056f0]/10 file:text-[#f056f0] file:font-semibold
                             hover:file:bg-[#f056f0]/20 transition-all" />
                {editTarget?.attachment && !attachFile && (
                  <a href={editTarget.attachment} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-dm-sans text-xs text-[#f056f0] hover:underline mt-1">
                    <FaDownload className="text-[10px]" /> Current: {editTarget.attachmentName ?? "File"}
                  </a>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-dm-sans text-sm text-gray-600
                             hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-dm-sans
                              text-sm font-semibold text-white transition-colors
                              ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><FaSave className="text-xs" /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}