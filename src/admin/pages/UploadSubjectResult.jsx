import { useState, useEffect } from "react";
import { FiCheck, FiAlertCircle, FiChevronDown } from "react-icons/fi";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.onrender.com";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];
const SCORE_FIELDS = [
  { key: "cwk",  label: "CWK",  max: 10 },
  { key: "hwk",  label: "HWK",  max: 10 },
  { key: "ca1",  label: "CA1",  max: 10 },
  { key: "ca2",  label: "CA2",  max: 10 },
  { key: "exam", label: "Exam", max: 60 },
];

const gradeInfo = (total) => {
  if (total >= 85) return { grade: "A", color: "text-emerald-600" };
  if (total >= 70) return { grade: "B", color: "text-blue-600"    };
  if (total >= 60) return { grade: "C", color: "text-indigo-500"  };
  if (total >= 50) return { grade: "D", color: "text-amber-500"   };
  if (total >= 40) return { grade: "E", color: "text-orange-500"  };
  return              { grade: "F", color: "text-red-500"      };
};

export default function UploadSubjectResult() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile,     setProfile]     = useState(null);

  const [selectedClass,   setSelectedClass]   = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [term,            setTerm]            = useState("");
  const [session,         setSession]         = useState("");

  const [students,        setStudents]        = useState([]);
  const [scores,          setScores]          = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [toast,           setToast]           = useState(null);

  // ── Load teacher profile on mount ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.message) {
          setProfile(data);
          // Pre-fill from profile
          if (data.assignedClass) setSelectedClass(data.assignedClass);
          if (data.subject)       setSelectedSubject(data.subject.split(",")[0].trim());
        }
      })
      .catch(() => {});
  }, []);

  // Class options — combine assignedClass (single) + assignedClasses (array)
  const classOptions = (() => {
    const fromArray  = Array.isArray(profile?.assignedClasses)
      ? profile.assignedClasses.filter(Boolean)
      : [];
    const fromSingle = profile?.assignedClass ? [profile.assignedClass] : [];
    return [...new Set([...fromArray, ...fromSingle])];
  })();

  // Subject options — may be comma-separated e.g. "Math, English"
  const subjectOptions = profile?.subject
    ? profile.subject.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // ── Load students when filters ready ──
  useEffect(() => {
    if (!selectedClass || !term || !session) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    const token = localStorage.getItem("token");
    fetch(`${API}/api/students`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        // Backend already filters by teacher's assignedClass via protectAdminOrUser
        setStudents(Array.isArray(data) ? data : []);
        setScores({});
      })
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [selectedClass, term, session]);

  const handleScore = (studentId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const getTotal = (studentId) => {
    const s = scores[studentId] || {};
    return SCORE_FIELDS.reduce((sum, f) => sum + (Number(s[f.key]) || 0), 0);
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveAll = async () => {
    if (!students.length) return;
    if (!selectedSubject) { showToast("error", "Please select a subject first."); return; }

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const responses = await Promise.all(
        students.map((student) => {
          const s = scores[student._id] || {};
          return fetch(`${API}/api/subject-results`, {
            method:  "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:  `Bearer ${token}`,
            },
            body: JSON.stringify({
              studentId:  student._id,
              subject:    selectedSubject,
              classLevel: selectedClass,
              term,
              session,
              cwk:  Number(s.cwk)  || 0,
              hwk:  Number(s.hwk)  || 0,
              ca1:  Number(s.ca1)  || 0,
              ca2:  Number(s.ca2)  || 0,
              exam: Number(s.exam) || 0,
            }),
          }).then((r) => r.json());
        })
      );

      const failed = responses.filter((r) => r.message && !r._id);
      if (failed.length) {
        showToast("error", failed[0].message || "Some scores failed to save.");
      } else {
        showToast("success", "All scores saved successfully!");
      }
    } catch {
      showToast("error", "Failed to save scores. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filtersComplete = selectedClass && selectedSubject && term && session;

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
          <div className="max-w-6xl mx-auto p-6 flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-jost font-bold text-gray-800 text-2xl">Upload Subject Scores</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  Enter scores for your assigned subject and class
                </p>
              </div>
              {filtersComplete && students.length > 0 && (
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="flex items-center gap-2 font-jost font-semibold px-6 py-2.5 rounded-full
                             bg-[#f056f0] hover:bg-[#525fe1] text-white text-sm
                             transition-colors duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><FiCheck className="text-base" /> Save All Scores</>
                  )}
                </button>
              )}
            </div>

            {/* Warning if no class assigned */}
            {profile && classOptions.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 font-dm-sans text-sm
                              px-5 py-3 rounded-2xl flex items-center gap-2">
                <FiAlertCircle />
                You have no class assigned yet. Contact admin to assign you a class.
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="font-jost font-semibold text-gray-700 text-sm mb-4">Select Class & Term</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Class */}
                <div className="flex flex-col gap-1">
                  <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">Class</label>
                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5
                                 font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0]
                                 transition-colors bg-white pr-9"
                    >
                      <option value="">Select class</option>
                      {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1">
                  <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">Subject</label>
                  <div className="relative">
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5
                                 font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0]
                                 transition-colors bg-white pr-9"
                    >
                      <option value="">Select subject</option>
                      {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
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
                               text-gray-700 focus:outline-none focus:border-[#f056f0]
                               transition-colors placeholder-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Score Table */}
            {filtersComplete && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-jost font-bold text-gray-800">{selectedSubject} — {selectedClass}</p>
                    <p className="font-dm-sans text-xs text-gray-400 mt-0.5">{term} · {session}</p>
                  </div>
                  {!loadingStudents && students.length > 0 && (
                    <span className="font-dm-sans text-xs text-gray-400">
                      {students.length} student{students.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loadingStudents ? (
                  <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                    <span className="w-5 h-5 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                    <span className="font-dm-sans text-sm">Loading students…</span>
                  </div>
                ) : students.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="font-dm-sans text-sm text-gray-400">No students found for this class.</p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:grid grid-cols-[2fr_repeat(5,_1fr)_1fr_1fr] gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100">
                      {["Student", ...SCORE_FIELDS.map((f) => `${f.label} /${f.max}`), "Total", "Grade"].map((h, i) => (
                        <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                      ))}
                    </div>

                    <div className="divide-y divide-gray-50">
                      {students.map((student) => {
                        const s     = scores[student._id] || {};
                        const total = getTotal(student._id);
                        const { grade, color } = gradeInfo(total);
                        return (
                          <div key={student._id}
                            className="grid grid-cols-1 md:grid-cols-[2fr_repeat(5,_1fr)_1fr_1fr] gap-3
                                       px-6 py-3 items-center hover:bg-[#fdf8ff] transition-colors duration-150">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#f056f0]/10 flex items-center justify-center shrink-0">
                                {student.profilePhoto ? (
                                  <img src={student.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-[#f056f0] font-bold text-xs">
                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                  </span>
                                )}
                              </div>
                              <p className="font-dm-sans text-sm font-semibold text-gray-700">
                                {student.firstName} {student.lastName}
                              </p>
                            </div>

                            {SCORE_FIELDS.map((f) => (
                              <div key={f.key}>
                                <label className="md:hidden font-dm-sans text-xs text-gray-400 mb-1 block">{f.label} /{f.max}</label>
                                <input
                                  type="number" min={0} max={f.max}
                                  value={s[f.key] ?? ""}
                                  onChange={(e) => handleScore(student._id, f.key, e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-center
                                             font-dm-sans text-sm text-gray-700 focus:outline-none
                                             focus:border-[#f056f0] transition-colors"
                                />
                              </div>
                            ))}

                            <div className="text-center">
                              <span className="font-jost font-bold text-gray-700 text-sm">{total}</span>
                            </div>
                            <div className="text-center">
                              <span className={`font-jost font-black text-lg ${color}`}>{grade}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full
                                   bg-[#f056f0] hover:bg-[#525fe1] text-white text-sm
                                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                        ) : (
                          <><FiCheck /> Save All Scores</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {!filtersComplete && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                <p className="font-dm-sans text-sm text-gray-400">
                  Select a class, subject, term, and session above to load students.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg
                         font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? <FiCheck className="text-base" /> : <FiAlertCircle className="text-base" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}