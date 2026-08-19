import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaUsers,
  FaPaperclip, FaTimes, FaSave, FaBookOpen,
} from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import {
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
} from "../../services/lmsApi";

const CLASSES  = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3","Kindergarten","Nursery 1","Nursery 2"];
const STATUSES = ["draft","published"];

const fmt     = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const isPast  = (d) => d && new Date(d) < new Date();

const statusColors = {
  draft:     "bg-gray-100 text-gray-500",
  published: "bg-emerald-100 text-emerald-700",
};

const Skeleton = () => (
  <div className="space-y-3 p-6">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
    ))}
  </div>
);

const blankForm = {
  title: "", description: "", subject: "", classLevel: "",
  dueDate: "", maxScore: 100, status: "draft",
};

export default function TeacherAssignments() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [assignments,  setAssignments]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [toast,        setToast]        = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [form,         setForm]         = useState(blankForm);
  const [file,         setFile]         = useState(null);

  // filters
  const [filterClass,  setFilterClass]  = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAssignments({ classLevel: filterClass, status: filterStatus });
      setAssignments(data.assignments ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(blankForm);
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditTarget(a);
    setForm({
      title:       a.title,
      description: a.description ?? "",
      subject:     a.subject,
      classLevel:  a.classLevel,
      dueDate:     a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : "",
      maxScore:    a.maxScore,
      status:      a.status,
    });
    setFile(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      if (file) fd.append("attachment", file);

      if (editTarget) {
        const data = await updateAssignment(editTarget._id, fd);
        setAssignments(prev => prev.map(a => a._id === editTarget._id ? data.assignment : a));
        showToast("success", "Assignment updated.");
      } else {
        const data = await createAssignment(fd);
        setAssignments(prev => [data.assignment, ...prev]);
        showToast("success", "Assignment created.");
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
      await deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a._id !== id));
      showToast("success", "Assignment deleted.");
    } catch (e) {
      showToast("error", e.message);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = assignments.filter(a =>
    (!filterClass  || a.classLevel === filterClass) &&
    (!filterStatus || a.status     === filterStatus)
  );

  const inputClass = `w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                      text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#f056f0]
                      transition-colors bg-white`;
  const labelClass = `font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block`;

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
                <h1 className="font-jost font-bold text-2xl text-gray-800">Assignments</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  Create and manage assignments for your classes
                </p>
              </div>
              <button onClick={openCreate}
                className="flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                           px-5 py-2.5 rounded-full font-jost font-semibold text-sm transition-colors shadow-sm">
                <FaPlus className="text-xs" /> New Assignment
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
              <select value={filterClass} onChange={e => { setFilterClass(e.target.value); }}
                className={`${inputClass} flex-1 min-w-[140px]`}>
                <option value="">All Classes</option>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className={`${inputClass} flex-1 min-w-[130px]`}>
                <option value="">All Status</option>
                {STATUSES.map(s => <option key={s} className="capitalize">{s}</option>)}
              </select>
              <button onClick={fetchData}
                className="px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                           font-dm-sans text-sm font-semibold transition-colors">
                Filter
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
                {error}
              </div>
            )}

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? <Skeleton /> : filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <FaBookOpen className="text-4xl text-gray-200 mx-auto mb-3" />
                  <p className="font-dm-sans text-sm text-gray-400">No assignments yet.</p>
                  <button onClick={openCreate}
                    className="mt-4 px-6 py-2 bg-[#f056f0] text-white rounded-full font-dm-sans text-sm
                               font-semibold hover:bg-[#525fe1] transition-colors">
                    Create First Assignment
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map(a => (
                    <div key={a._id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#fdf8ff] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-dm-sans font-semibold text-gray-700 text-sm">{a.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-dm-sans capitalize
                            ${statusColors[a.status]}`}>{a.status}</span>
                          {isPast(a.dueDate) && a.status === "published" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold font-dm-sans
                                             bg-red-100 text-red-500">Overdue</span>
                          )}
                        </div>
                        <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                          {a.subject} · {a.classLevel} · Due {fmt(a.dueDate)} · Max {a.maxScore} pts
                        </p>
                        {a.attachment && (
                          <a href={a.attachment} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 font-dm-sans text-xs text-[#f056f0] hover:underline mt-1">
                            <FaPaperclip className="text-[10px]" /> {a.attachmentName ?? "Attachment"}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => navigate(`/teacher/lms/submissions/${a._id}`)}
                          title="View Submissions"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg
                                     font-dm-sans text-xs text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">
                          <FaUsers className="text-xs" /> Submissions
                        </button>
                        <button onClick={() => openEdit(a)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                                     hover:bg-[#f056f0]/10 hover:text-[#f056f0] transition-colors">
                          <FaEdit className="text-sm" />
                        </button>
                        <button onClick={() => handleDelete(a._id, a.title)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                                     hover:bg-red-50 hover:text-red-500 transition-colors">
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-jost font-bold text-gray-800">
                {editTarget ? "Edit Assignment" : "New Assignment"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
                  placeholder="e.g. Chapter 3 Summary" required className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Subject *</label>
                  <input type="text" value={form.subject} onChange={e => set("subject", e.target.value)}
                    placeholder="e.g. Mathematics" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Class *</label>
                  <select value={form.classLevel} onChange={e => set("classLevel", e.target.value)}
                    required className={`${inputClass} appearance-none`}>
                    <option value="">Select class</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Instructions / Description</label>
                <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Describe the assignment task..."
                  className={`${inputClass} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Due Date & Time *</label>
                  <input type="datetime-local" value={form.dueDate}
                    onChange={e => set("dueDate", e.target.value)}
                    required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Max Score</label>
                  <input type="number" min={1} value={form.maxScore}
                    onChange={e => set("maxScore", e.target.value)}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={e => set("status", e.target.value)}
                  className={`${inputClass} appearance-none`}>
                  <option value="draft">Draft — not visible to students</option>
                  <option value="published">Published — visible to students</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Attachment (PDF, DOC, DOCX, Image)</label>
                <input type="file"
                  accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                  onChange={e => setFile(e.target.files[0] ?? null)}
                  className="w-full font-dm-sans text-sm text-gray-600
                             file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0
                             file:bg-[#f056f0]/10 file:text-[#f056f0] file:font-semibold
                             hover:file:bg-[#f056f0]/20 transition-all" />
                {editTarget?.attachment && !file && (
                  <a href={editTarget.attachment} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-dm-sans text-xs text-[#f056f0] hover:underline mt-1">
                    <FaPaperclip className="text-[10px]" /> Current: {editTarget.attachmentName ?? "Attachment"}
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
                    : <><FaSave className="text-xs" /> {editTarget ? "Save" : "Create"}</>}
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