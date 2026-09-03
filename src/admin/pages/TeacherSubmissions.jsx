import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft, FaDownload, FaCheckCircle,
  FaClock, FaExclamationCircle, FaStar, FaTimes, FaSave,
} from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getSubmissions, gradeSubmission } from "../../services/LmsApi";

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";

const statusMeta = {
  pending:   { label: "Not Submitted", color: "bg-gray-100 text-gray-500",    icon: <FaClock /> },
  submitted: { label: "Submitted",     color: "bg-blue-100 text-blue-700",    icon: <FaCheckCircle /> },
  late:      { label: "Late",          color: "bg-amber-100 text-amber-700",  icon: <FaExclamationCircle /> },
  graded:    { label: "Graded",        color: "bg-emerald-100 text-emerald-700", icon: <FaStar /> },
};

const Skeleton = () => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-4">
        <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-36" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
        </div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
      </div>
    ))}
  </div>
);

export default function TeacherSubmissions() {
  const { id }     = useParams(); // assignment id
  const navigate   = useNavigate();
  const location   = useLocation();
  const hasFetched = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignment,  setAssignment]  = useState(null);
  const [rows,        setRows]        = useState([]); // { student, submission }
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState(null);

  // Grade modal
  const [gradeModal,   setGradeModal]   = useState(null); // submission object
  const [score,        setScore]        = useState("");
  const [feedback,     setFeedback]     = useState("");
  const [grading,      setGrading]      = useState(false);

  // Filter
  const [filter, setFilter] = useState("all"); // all | submitted | graded | pending

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getSubmissions(id)
      .then(data => {
        setAssignment(data.assignment);
        setRows(data.submissions ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const openGradeModal = (submission) => {
    setGradeModal(submission);
    setScore(submission.score ?? "");
    setFeedback(submission.feedback ?? "");
  };

  const handleGrade = async () => {
    if (score === "" || score === null) { showToast("error", "Please enter a score"); return; }
    setGrading(true);
    try {
      const data = await gradeSubmission(gradeModal._id, { score: Number(score), feedback });
      setRows(prev => prev.map(r =>
        r.submission?._id === gradeModal._id
          ? { ...r, submission: data.submission }
          : r
      ));
      showToast("success", "Submission graded.");
      setGradeModal(null);
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setGrading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = rows.filter(r => {
    if (filter === "all")       return true;
    if (filter === "pending")   return !r.submission || r.submission.status === "pending";
    if (filter === "submitted") return ["submitted","late"].includes(r.submission?.status);
    if (filter === "graded")    return r.submission?.status === "graded";
    return true;
  });

  const counts = {
    total:     rows.length,
    submitted: rows.filter(r => ["submitted","late"].includes(r.submission?.status)).length,
    graded:    rows.filter(r => r.submission?.status === "graded").length,
    pending:   rows.filter(r => !r.submission || r.submission?.status === "pending").length,
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <button onClick={() => navigate(location.pathname.startsWith("/admin/") ? "/admin/learning/assignments" : "/teacher/lms/assignments")}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f056f0] mb-3 transition-colors">
                <FaArrowLeft /> Back to Assignments
              </button>
              {assignment ? (
                <>
                  <h1 className="font-jost font-bold text-2xl text-gray-800">{assignment.title}</h1>
                  <p className="font-dm-sans text-sm text-gray-400 mt-1">
                    {assignment.subject} · {assignment.classLevel} · Due {fmt(assignment.dueDate)}
                    · Max Score: {assignment.maxScore}
                  </p>
                </>
              ) : (
                <div className="h-8 bg-gray-100 rounded-xl animate-pulse w-60" />
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Students", value: counts.total,     color: "text-gray-800"    },
                { label: "Submitted",      value: counts.submitted, color: "text-blue-600"    },
                { label: "Graded",         value: counts.graded,    color: "text-emerald-600" },
                { label: "Not Submitted",  value: counts.pending,   color: "text-amber-600"   },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className={`font-jost font-bold text-2xl ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 flex-wrap">
              {[
                { key: "all",       label: `All (${counts.total})`         },
                { key: "submitted", label: `Submitted (${counts.submitted})` },
                { key: "graded",    label: `Graded (${counts.graded})`     },
                { key: "pending",   label: `Pending (${counts.pending})`   },
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

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">{error}</div>
            )}

            {/* Submissions table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1.2fr_1fr_auto] gap-3
                              px-6 py-3 bg-gray-50 border-b border-gray-100">
                {["Student","Status","Submitted","Score","Feedback",""].map((h, i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                ))}
              </div>

              {loading ? <Skeleton /> : filtered.length === 0 ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No submissions match this filter.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map(({ student, submission }) => {
                    const meta   = statusMeta[submission?.status ?? "pending"];
                    const hasFile = !!submission?.attachment;
                    return (
                      <div key={student._id}
                        className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr_1fr_1.2fr_1fr_auto] gap-3
                                   px-6 py-4 items-center hover:bg-[#fdf8ff] transition-colors">
                        {/* Student */}
                        <div className="flex items-center gap-3">
                          {student.profilePhoto ? (
                            <img src={student.profilePhoto} alt=""
                              className="w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                              <span className="font-jost font-bold text-[#f056f0] text-xs">
                                {student.firstName?.[0]}{student.lastName?.[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-dm-sans font-semibold text-gray-700 text-sm">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="font-dm-sans text-xs text-gray-400">{student.regNumber}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                                          font-semibold font-dm-sans w-fit ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </span>

                        {/* Submitted at */}
                        <span className="font-dm-sans text-xs text-gray-400">
                          {submission?.submittedAt ? fmt(submission.submittedAt) : "—"}
                        </span>

                        {/* Score */}
                        <span className={`font-jost font-bold text-sm
                          ${submission?.status === "graded" ? "text-emerald-600" : "text-gray-300"}`}>
                          {submission?.status === "graded"
                            ? `${submission.score} / ${assignment?.maxScore}`
                            : "—"}
                        </span>

                        {/* Feedback preview */}
                        <span className="font-dm-sans text-xs text-gray-400 truncate max-w-[120px]">
                          {submission?.feedback || "—"}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {hasFile && (
                            <a href={submission.attachment} target="_blank" rel="noreferrer"
                              title={`Download: ${submission.attachmentName ?? "file"}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                                         hover:bg-blue-50 hover:text-blue-500 transition-colors">
                              <FaDownload className="text-sm" />
                            </a>
                          )}
                          {submission && ["submitted","late","graded"].includes(submission.status) && (
                            <button onClick={() => openGradeModal(submission)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-dm-sans text-xs font-semibold transition-colors
                                ${submission.status === "graded"
                                  ? "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                  : "bg-[#f056f0] text-white hover:bg-[#525fe1]"}`}>
                              <FaStar className="text-[10px]" />
                              {submission.status === "graded" ? "Edit Grade" : "Grade"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Grade Modal */}
      {gradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-jost font-bold text-gray-800">Grade Submission</h3>
              <button onClick={() => setGradeModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>

            {gradeModal.attachment && (
              <a href={gradeModal.attachment} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl
                           font-dm-sans text-sm text-blue-600 hover:bg-blue-100 transition-colors">
                <FaDownload className="text-xs" />
                View / Download: {gradeModal.attachmentName ?? "Submission File"}
              </a>
            )}

            {gradeModal.comment && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-dm-sans text-xs text-gray-400 mb-1">Student Comment</p>
                <p className="font-dm-sans text-sm text-gray-600">{gradeModal.comment}</p>
              </div>
            )}

            <div>
              <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                Score (out of {assignment?.maxScore}) *
              </label>
              <input type="number" min={0} max={assignment?.maxScore}
                value={score} onChange={e => setScore(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                           focus:outline-none focus:border-[#f056f0] transition-colors" />
            </div>

            <div>
              <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block">
                Feedback
              </label>
              <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder="Write feedback for the student..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                           focus:outline-none focus:border-[#f056f0] resize-none transition-colors" />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setGradeModal(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-dm-sans text-sm text-gray-600
                           hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">Cancel</button>
              <button onClick={handleGrade} disabled={grading}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-dm-sans
                            text-sm font-semibold text-white transition-colors
                            ${grading ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {grading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><FaSave className="text-xs" /> Save Grade</>}
              </button>
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