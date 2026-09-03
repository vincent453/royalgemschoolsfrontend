import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaBookOpen, FaCheckCircle, FaClock,
  FaExclamationCircle, FaStar, FaPaperclip, FaUpload,
  FaTimes, FaSave,
} from "react-icons/fa";
import { getMyAssignments, submitAssignment } from "../../services/lmsApi";

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";

const isPast = (d) => d && new Date(d) < new Date();

const statusMeta = {
  pending:   { label: "Not Submitted", color: "bg-gray-100 text-gray-500",       icon: <FaClock /> },
  submitted: { label: "Submitted",     color: "bg-blue-100 text-blue-700",       icon: <FaCheckCircle /> },
  late:      { label: "Late",          color: "bg-amber-100 text-amber-700",     icon: <FaExclamationCircle /> },
  graded:    { label: "Graded",        color: "bg-emerald-100 text-emerald-700", icon: <FaStar /> },
};

const Skeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
    ))}
  </div>
);

export default function StudentAssignments() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [assignments,  setAssignments]  = useState([]); // [{ assignment, submission }]
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [toast,        setToast]        = useState(null);

  // Submit modal
  const [submitModal,  setSubmitModal]  = useState(null); // assignment object
  const [comment,      setComment]      = useState("");
  const [file,         setFile]         = useState(null);
  const [submitting,   setSubmitting]   = useState(false);

  // Filter
  const [filter, setFilter] = useState("all"); // all | pending | submitted | graded

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem("portalToken");
    if (!token) { navigate("/portal"); return; }

    getMyAssignments()
      .then(data => setAssignments(data.assignments ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const openSubmit = (assignment) => {
    setSubmitModal(assignment);
    setComment("");
    setFile(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (comment.trim()) fd.append("comment", comment.trim());
      if (file)           fd.append("attachment", file);

      const data = await submitAssignment(submitModal._id, fd);

      // Update local state
      setAssignments(prev => prev.map(row =>
        row.assignment._id === submitModal._id
          ? { ...row, submission: data.submission }
          : row
      ));

      setSubmitModal(null);
      showToast("success", data.isLate
        ? "Submitted — marked as late (past due date)."
        : "Assignment submitted successfully!");
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const filtered = assignments.filter(({ assignment, submission }) => {
    if (filter === "all")       return true;
    if (filter === "pending")   return !submission || submission.status === "pending";
    if (filter === "submitted") return ["submitted","late"].includes(submission?.status);
    if (filter === "graded")    return submission?.status === "graded";
    return true;
  });

  const counts = {
    total:     assignments.length,
    pending:   assignments.filter(r => !r.submission || r.submission.status === "pending").length,
    submitted: assignments.filter(r => ["submitted","late"].includes(r.submission?.status)).length,
    graded:    assignments.filter(r => r.submission?.status === "graded").length,
  };

  return (
    <div className="min-h-screen bg-[#E6EBEE]">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-[#f056f0] h-[60px] flex items-center px-6 gap-4 shadow-md">
        <button onClick={() => navigate("/portal")}
          className="text-white/80 hover:text-white transition-colors">
          <FaArrowLeft />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">My Assignments</h1>
        <span className="text-white/70 text-sm">{counts.pending} pending</span>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">{error}</div>
        )}

        {/* Summary cards */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total",     value: counts.total,     color: "text-gray-800"    },
              { label: "Pending",   value: counts.pending,   color: "text-amber-600"   },
              { label: "Submitted", value: counts.submitted, color: "text-blue-600"    },
              { label: "Graded",    value: counts.graded,    color: "text-emerald-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <p className="font-dm-sans text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`font-jost font-bold text-2xl ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-2 flex-wrap">
          {[
            { key: "all",       label: "All"       },
            { key: "pending",   label: "Pending"   },
            { key: "submitted", label: "Submitted" },
            { key: "graded",    label: "Graded"    },
          ].map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-colors
                ${filter === t.key
                  ? "bg-[#f056f0] text-white"
                  : "text-gray-500 hover:bg-gray-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Assignment cards */}
        {loading ? <Skeleton /> : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center shadow-sm">
            <FaBookOpen className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="font-dm-sans text-sm text-gray-400">
              {filter === "all" ? "No assignments yet." : "No assignments in this category."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(({ assignment, submission }) => {
              const meta    = statusMeta[submission?.status ?? "pending"];
              const overdue = isPast(assignment.dueDate) && (!submission || submission.status === "pending");
              const canSubmit = assignment.status === "published" &&
                (!submission || submission.status === "pending" || submission.status === "late");

              return (
                <div key={assignment._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Top accent */}
                  <div className={`h-1 w-full ${
                    submission?.status === "graded"    ? "bg-emerald-400" :
                    submission?.status === "submitted" ? "bg-blue-400" :
                    submission?.status === "late"      ? "bg-amber-400" :
                    overdue                            ? "bg-red-400" :
                    "bg-[#f056f0]"
                  }`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-jost font-bold text-gray-800 text-base">{assignment.title}</p>
                        <p className="font-dm-sans text-xs text-gray-400 mt-1">
                          {assignment.subject}
                          {assignment.teacher?.name ? ` · ${assignment.teacher.name}` : ""}
                          · Max {assignment.maxScore} pts
                        </p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                                        font-semibold font-dm-sans flex-shrink-0 ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>

                    {assignment.description && (
                      <p className="font-dm-sans text-sm text-gray-600 mt-3 leading-6">
                        {assignment.description}
                      </p>
                    )}

                    {/* Due date */}
                    <div className={`flex items-center gap-2 mt-3 font-dm-sans text-sm font-semibold
                      ${overdue ? "text-red-500" : "text-gray-500"}`}>
                      <FaClock className="text-xs" />
                      Due: {fmt(assignment.dueDate)}
                      {overdue && <span className="text-red-500 font-bold">(Overdue)</span>}
                    </div>

                    {/* Assignment attachment */}
                    {assignment.attachment && (
                      <a href={assignment.attachment} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 font-dm-sans text-xs text-[#f056f0] hover:underline">
                        <FaPaperclip className="text-[10px]" />
                        {assignment.attachmentName ?? "Download Attachment"}
                      </a>
                    )}

                    {/* Grade result */}
                    {submission?.status === "graded" && (
                      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-dm-sans font-semibold text-emerald-700 text-sm">Grade</p>
                          <p className="font-jost font-black text-emerald-700 text-xl">
                            {submission.score} / {assignment.maxScore}
                          </p>
                        </div>
                        {submission.feedback && (
                          <div>
                            <p className="font-dm-sans text-xs text-emerald-600 font-semibold mb-1">Teacher Feedback:</p>
                            <p className="font-dm-sans text-sm text-emerald-700">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission info */}
                    {submission && submission.status !== "pending" && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                        <p className="font-dm-sans text-xs text-gray-500">
                          Submitted: {fmt(submission.submittedAt)}
                          {submission.status === "late" && (
                            <span className="text-amber-600 font-semibold ml-2">(Late)</span>
                          )}
                        </p>
                        {submission.comment && (
                          <p className="font-dm-sans text-xs text-gray-500 mt-1">
                            Your note: {submission.comment}
                          </p>
                        )}
                        {submission.attachment && (
                          <a href={submission.attachment} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 font-dm-sans text-xs text-[#f056f0] hover:underline mt-1">
                            <FaPaperclip className="text-[10px]" />
                            {submission.attachmentName ?? "Your submission file"}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Submit button */}
                    {canSubmit && (
                      <button onClick={() => openSubmit(assignment)}
                        className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1]
                                   text-white rounded-full font-dm-sans text-sm font-semibold transition-colors">
                        <FaUpload className="text-xs" />
                        {submission?.status === "late" ? "Resubmit" : "Submit Assignment"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-jost font-bold text-gray-800">Submit Assignment</h3>
              <button onClick={() => setSubmitModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-[#f056f0]/5 border border-[#f056f0]/20 rounded-xl">
                <p className="font-dm-sans font-semibold text-gray-700 text-sm">{submitModal.title}</p>
                <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                  Due: {fmt(submitModal.dueDate)}
                  {isPast(submitModal.dueDate) && (
                    <span className="text-amber-600 font-semibold ml-2">— Submission will be marked late</span>
                  )}
                </p>
              </div>

              <div>
                <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                  Comment / Note (optional)
                </label>
                <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Add a note for your teacher..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                             focus:outline-none focus:border-[#f056f0] resize-none transition-colors" />
              </div>

              <div>
                <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                  Attach Completed Work (optional)
                </label>
                <input type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/jpeg,image/png,image/webp"
                  onChange={e => setFile(e.target.files[0] ?? null)}
                  className="w-full font-dm-sans text-sm text-gray-600
                             file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0
                             file:bg-[#f056f0]/10 file:text-[#f056f0] file:font-semibold
                             hover:file:bg-[#f056f0]/20 transition-all" />
                <p className="font-dm-sans text-[11px] text-gray-400 mt-1">
                  PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, or WEBP (max 10MB)
                </p>
                {file && (
                  <p className="font-dm-sans text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" /> {file.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSubmitModal(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-dm-sans text-sm text-gray-600
                             hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">Cancel</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-dm-sans
                              text-sm font-semibold text-white transition-colors
                              ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    : <><FaSave className="text-xs" /> Submit</>}
                </button>
              </div>
            </div>
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