import { useState, useEffect } from "react";
import { FiCheck, FiAlertCircle, FiChevronDown, FiUser, FiAlertTriangle } from "react-icons/fi";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.vercel.app";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];

const AFFECTIVE = [
  "Punctuality", "Neatness", "Comportment in Class", "Organisation",
  "Promptness to Complete Work", "Creativity", "Relationship with Other Pupils",
];
const PSYCHOMOTOR = [
  "Handwriting", "Games / Sports", "Handling of Learning Materials", "Public Speaking",
];
const INCLUSIVE = [
  "Practical Life Exercise", "Reading", "Circle Time",
];

const ratingLabel = (r) => ["", "Poor", "Below Avg", "Average", "Good", "Excellent"][r] ?? "";
const ratingColor = (r) => {
  if (r >= 5) return "bg-emerald-500";
  if (r >= 4) return "bg-blue-500";
  if (r >= 3) return "bg-indigo-400";
  if (r >= 2) return "bg-amber-400";
  return "bg-red-400";
};

const gradeInfo = (total) => {
  if (total >= 85) return { grade: "A", remark: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" };
  if (total >= 70) return { grade: "B", remark: "V.Good",    color: "text-blue-600",    bg: "bg-blue-50"    };
  if (total >= 60) return { grade: "C", remark: "Good",      color: "text-indigo-500",  bg: "bg-indigo-50"  };
  if (total >= 50) return { grade: "D", remark: "Fair",      color: "text-amber-500",   bg: "bg-amber-50"   };
  if (total >= 40) return { grade: "E", remark: "Poor",      color: "text-orange-500",  bg: "bg-orange-50"  };
  return              { grade: "F", remark: "Fail",      color: "text-red-500",     bg: "bg-red-50"     };
};

// Build default disposition arrays
const makeDispositions = (labels) => labels.map((label) => ({ label, rating: null }));

export default function FinalizeResult() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Step management: "filter" → "review" → "details"
  const [step, setStep] = useState("filter");

  // Filters
  const [classLevel, setClassLevel]   = useState("");
  const [term,       setTerm]         = useState("");
  const [session,    setSession]      = useState("");

  // Students list
  const [students,        setStudents]        = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Selected student + their subject results
  const [selectedStudent,  setSelectedStudent]  = useState(null);
  const [subjectResults,   setSubjectResults]   = useState([]);
  const [loadingSubjects,  setLoadingSubjects]  = useState(false);
  const [missingSubjects,  setMissingSubjects]  = useState([]);

  // Extra fields for finalization
  const [attendance, setAttendance] = useState({
    timesSchoolOpened:       "",
    timesPresent:            "",
    numberOfStudentsInClass: "",
  });
  const [affective,   setAffective]   = useState(makeDispositions(AFFECTIVE));
  const [psychomotor, setPsychomotor] = useState(makeDispositions(PSYCHOMOTOR));
  const [inclusive,   setInclusive]   = useState(makeDispositions(INCLUSIVE));
  const [teacherRemark,  setTeacherRemark]  = useState("");
  const [headRemark,     setHeadRemark]     = useState("");
  const [nextTermBegins, setNextTermBegins] = useState("");

  // UI
  const [saving, setSaving]   = useState(false);
  const [toast,  setToast]    = useState(null);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Load students for chosen class/term/session
  const loadStudents = async () => {
    if (!classLevel || !term || !session) return;
    setLoadingStudents(true);
    const token = localStorage.getItem("token");
    try {
      const params = new URLSearchParams({ classLevel });
      // Fetch all students in the class from /api/students
      const res  = await fetch(`${API}/api/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
      setStep("review");
    } catch {
      showToast("error", "Failed to load students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Load subject results for a student
  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setSubjectResults([]);
    setMissingSubjects([]);
    setAlreadyDone(false);
    setLoadingSubjects(true);
    const token = localStorage.getItem("token");
    try {
      const params = new URLSearchParams({ classLevel, term, session });
      const res  = await fetch(`${API}/api/subject-results/student/${student._id}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubjectResults(Array.isArray(data) ? data : []);

      // Also check if result already finalized
      const chk = await fetch(`${API}/api/results/${student._id}?term=${term}&session=${session}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (chk.ok) setAlreadyDone(true);

      setStep("details");
    } catch {
      showToast("error", "Failed to load subject results.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const updateRating = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], rating: Number(value) };
      return updated;
    });
  };

  const handleFinalize = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/results/finalize`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId:               selectedStudent._id,
          term,
          session,
          timesSchoolOpened:       Number(attendance.timesSchoolOpened)       || 0,
          timesPresent:            Number(attendance.timesPresent)            || 0,
          numberOfStudentsInClass: Number(attendance.numberOfStudentsInClass) || 0,
          affectiveDispositions:       affective,
          psychomotorDispositions:     psychomotor,
          inclusiveLearningActivities: inclusive,
          teacherRemark,
          headRemark,
          nextTermBegins,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.missingSubjects) setMissingSubjects(data.missingSubjects);
        throw new Error(data.message || "Failed to finalize");
      }
      showToast("success", `Result for ${selectedStudent.firstName} published!`);
      setAlreadyDone(true);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalScore   = subjectResults.reduce((s, r) => s + r.total, 0);
  const average      = subjectResults.length ? (totalScore / subjectResults.length).toFixed(1) : 0;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-jost font-bold text-gray-800 text-2xl">Finalize Results</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  Review subject scores and publish the final result card
                </p>
              </div>
              {step !== "filter" && (
                <button
                  onClick={() => { setStep("filter"); setSelectedStudent(null); setStudents([]); }}
                  className="font-dm-sans text-sm text-[#f056f0] hover:underline"
                >
                  ← Start over
                </button>
              )}
            </div>

            {/* ── STEP 1: Filters ── */}
            {step === "filter" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="font-jost font-semibold text-gray-700 mb-4">Select Class & Term</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Class */}
                  <div className="flex flex-col gap-1">
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">Class</label>
                    <input
                      type="text"
                      value={classLevel}
                      onChange={(e) => setClassLevel(e.target.value)}
                      placeholder="e.g. JSS 1"
                      className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                 text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors"
                    />
                  </div>

                  {/* Term */}
                  <div className="flex flex-col gap-1">
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">Term</label>
                    <div className="relative">
                      <select
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5
                                   font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0]
                                   transition-colors bg-white pr-9"
                      >
                        <option value="">Select term</option>
                        {TERMS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Session */}
                  <div className="flex flex-col gap-1">
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">Session</label>
                    <input
                      type="text"
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                      placeholder="e.g. 2024/2025"
                      className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                 text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors placeholder-gray-300"
                    />
                  </div>
                </div>

                <button
                  onClick={loadStudents}
                  disabled={!classLevel || !term || !session || loadingStudents}
                  className="mt-6 flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full
                             bg-[#f056f0] hover:bg-[#525fe1] text-white text-sm
                             transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStudents ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading…</>
                  ) : "Load Students →"}
                </button>
              </div>
            )}

            {/* ── STEP 2: Student list ── */}
            {step === "review" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="font-jost font-bold text-gray-800">{classLevel} — {term} · {session}</p>
                  <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                    Select a student to review and finalize their result
                  </p>
                </div>

                {students.length === 0 ? (
                  <div className="py-16 text-center font-dm-sans text-sm text-gray-400">
                    No students found in this class.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {students.map((s) => (
                      <button
                        key={s._id}
                        onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-4 px-6 py-4 text-left
                                   hover:bg-[#fdf8ff] transition-colors duration-150"
                      >
                        {s.profilePhoto ? (
                          <img src={s.profilePhoto} alt={s.firstName}
                            className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#f056f0]/10 flex items-center justify-center shrink-0">
                            <span className="text-[#f056f0] font-bold text-xs">
                              {s.firstName?.[0]}{s.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-dm-sans font-semibold text-gray-700 text-sm truncate">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="font-dm-sans text-xs text-gray-400">{s.regNumber}</p>
                        </div>
                        <span className="text-[#f056f0] text-sm font-dm-sans">Review →</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Review + Details ── */}
            {step === "details" && selectedStudent && (
              <>
                {/* Student banner */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                  {selectedStudent.profilePhoto ? (
                    <img src={selectedStudent.profilePhoto} alt={selectedStudent.firstName}
                      className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-[#f056f0]/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#f056f0]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#f056f0] font-bold text-lg">
                        {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-jost font-bold text-gray-800 text-lg">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                    <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                      {selectedStudent.regNumber} · {classLevel} · {term} · {session}
                    </p>
                  </div>
                  {alreadyDone && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700
                                     text-xs font-dm-sans font-semibold rounded-full">
                      <FiCheck /> Published
                    </span>
                  )}
                </div>

                {/* Missing subjects warning */}
                {missingSubjects.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3">
                    <FiAlertTriangle className="text-amber-500 text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="font-dm-sans font-semibold text-amber-700 text-sm">Missing subject scores</p>
                      <p className="font-dm-sans text-xs text-amber-600 mt-0.5">
                        {missingSubjects.join(", ")} — subject teachers must upload scores before finalizing.
                      </p>
                    </div>
                  </div>
                )}

                {/* Subject scores table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <p className="font-jost font-bold text-gray-800">Subject Scores</p>
                    <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                      Uploaded by subject teachers — read only
                    </p>
                  </div>

                  {loadingSubjects ? (
                    <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                      <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                      <span className="font-dm-sans text-sm">Loading scores…</span>
                    </div>
                  ) : subjectResults.length === 0 ? (
                    <div className="py-12 text-center font-dm-sans text-sm text-gray-400">
                      No subject scores uploaded yet.
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-2.5 bg-gray-50 border-b border-gray-100">
                        {["Subject","CWK","HWK","CA1","CA2","Exam","Total","Grade"].map((h) => (
                          <span key={h} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                        ))}
                      </div>

                      <div className="divide-y divide-gray-50">
                        {subjectResults.map((r) => {
                          const { grade, color, bg } = gradeInfo(r.total);
                          return (
                            <div key={r._id}
                              className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-3 items-center">
                              <p className="font-dm-sans font-semibold text-gray-700 text-sm">{r.subject}</p>
                              {[r.cwk, r.hwk, r.ca1, r.ca2, r.exam].map((v, i) => (
                                <span key={i} className="font-dm-sans text-sm text-gray-600 text-center md:text-left">{v}</span>
                              ))}
                              <span className="font-jost font-bold text-gray-800">{r.total}</span>
                              <span className={`inline-block w-fit px-2.5 py-0.5 rounded-full font-jost font-bold text-sm ${color} ${bg}`}>
                                {grade}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary bar */}
                      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-6">
                        {[
                          { label: "Total Score", value: totalScore },
                          { label: "Average",     value: `${average}%` },
                          { label: "Subjects",    value: subjectResults.length },
                          { label: "Status",      value: Number(average) >= 40 ? "Pass" : "Fail" },
                        ].map((s) => (
                          <div key={s.label} className="flex flex-col">
                            <span className="font-dm-sans text-xs text-gray-400">{s.label}</span>
                            <span className={`font-jost font-bold text-lg ${
                              s.label === "Status"
                                ? (s.value === "Pass" ? "text-emerald-600" : "text-red-500")
                                : "text-gray-800"
                            }`}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Attendance */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <p className="font-jost font-bold text-gray-800 mb-4">Attendance</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: "timesSchoolOpened",       label: "Days School Opened" },
                      { key: "timesPresent",            label: "Days Present" },
                      { key: "numberOfStudentsInClass", label: "Students in Class" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">
                          {label}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={attendance[key]}
                          onChange={(e) => setAttendance((p) => ({ ...p, [key]: e.target.value }))}
                          className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                     text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispositions */}
                {[
                  { title: "Affective Dispositions",        state: affective,   setter: setAffective   },
                  { title: "Psychomotor Dispositions",      state: psychomotor, setter: setPsychomotor },
                  { title: "Inclusive Learning Activities", state: inclusive,   setter: setInclusive   },
                ].map(({ title, state, setter }) => (
                  <div key={title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="font-jost font-bold text-gray-800 mb-4">{title}</p>
                    <div className="flex flex-col gap-3">
                      {state.map((item, idx) => (
                        <div key={item.label} className="flex items-center gap-4">
                          <span className="font-dm-sans text-sm text-gray-700 flex-1 min-w-0">{item.label}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <button
                                key={v}
                                onClick={() => updateRating(setter, idx, v)}
                                className={`w-8 h-8 rounded-lg text-xs font-jost font-bold transition-all duration-150
                                            ${item.rating === v
                                              ? `${ratingColor(v)} text-white shadow-sm`
                                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                          <span className="font-dm-sans text-xs text-gray-400 w-20 text-right">
                            {item.rating ? ratingLabel(item.rating) : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Remarks & Next Term */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                  <p className="font-jost font-bold text-gray-800">Remarks & Admin</p>

                  <div className="flex flex-col gap-1">
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">
                      Class Teacher's Remark
                    </label>
                    <textarea
                      rows={2}
                      value={teacherRemark}
                      onChange={(e) => setTeacherRemark(e.target.value)}
                      placeholder="e.g. A hardworking student. Keep it up!"
                      className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                 text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors
                                 resize-none placeholder-gray-300"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">
                      Head of School's Remark
                    </label>
                    <textarea
                      rows={2}
                      value={headRemark}
                      onChange={(e) => setHeadRemark(e.target.value)}
                      placeholder="e.g. Excellent performance. We are proud of you."
                      className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                 text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors
                                 resize-none placeholder-gray-300"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">
                      Next Term Begins
                    </label>
                    <input
                      type="text"
                      value={nextTermBegins}
                      onChange={(e) => setNextTermBegins(e.target.value)}
                      placeholder="e.g. Monday, 4th May 2026"
                      className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                                 text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors placeholder-gray-300"
                    />
                  </div>
                </div>

                {/* Publish button */}
                {!alreadyDone && (
                  <div className="flex justify-end pb-6">
                    <button
                      onClick={handleFinalize}
                      disabled={saving || subjectResults.length === 0}
                      className="flex items-center gap-2 font-jost font-semibold px-10 py-3 rounded-full
                                 bg-[#f056f0] hover:bg-[#525fe1] text-white text-sm shadow-md
                                 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing…</>
                      ) : (
                        <><FiCheck /> Publish Result</>
                      )}
                    </button>
                  </div>
                )}

                {alreadyDone && (
                  <div className="flex justify-end pb-6">
                    <button
                      onClick={() => { setStep("review"); setSelectedStudent(null); }}
                      className="font-dm-sans text-sm text-[#f056f0] hover:underline"
                    >
                      ← Back to student list
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg
                         font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success"
            ? <FiCheck className="text-base" />
            : <FiAlertCircle className="text-base" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}