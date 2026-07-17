import { useState, useEffect } from "react";
import { FiCheck, FiAlertCircle, FiChevronDown } from "react-icons/fi";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";

const API   = import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app";
const TERMS = ["1st Term", "2nd Term", "3rd Term"];

// ── Score fields per term ────────────────────────────────────
const TERM_FIELDS = {
  "1st Term": [
    { key: "hwk",  label: "HWK",  max: 10 },
    { key: "cf",   label: "C.F",  max: 10 },
    { key: "ca1",  label: "CA1",  max: 10 },
    { key: "ca2",  label: "CA2",  max: 10 },
    { key: "exam", label: "Exam", max: 60 },
  ],
  "2nd Term": [
    { key: "hwk",  label: "HWK",  max: 10 },
    { key: "cf",   label: "C.F",  max: 10 },
    { key: "ca1",  label: "CA1",  max: 10 },
    { key: "ca2",  label: "CA2",  max: 10 },
    { key: "exam", label: "Exam", max: 60 },
  ],
  "3rd Term": [
    { key: "hwk",  label: "HWK",  max: 10 },
    { key: "cf",   label: "C.F",  max: 10 },
    { key: "ca1",  label: "CA1",  max: 10 },
    { key: "ca2",  label: "CA2",  max: 10 },
    { key: "exam", label: "Exam", max: 60 },
  ],
};

const MAX_TOTAL = 90;

const gradeInfo = (total) => {
  const pct = (total / MAX_TOTAL) * 100;
  if (pct >= 85) return { grade: "A", color: "text-emerald-600" };
  if (pct >= 70) return { grade: "B", color: "text-blue-600"    };
  if (pct >= 60) return { grade: "C", color: "text-indigo-500"  };
  if (pct >= 50) return { grade: "D", color: "text-amber-500"   };
  if (pct >= 40) return { grade: "E", color: "text-orange-500"  };
  return              { grade: "F", color: "text-red-500"      };
};

export default function UploadSubjectResult() {
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [profile,         setProfile]         = useState(null);
  const [assignments,     setAssignments]     = useState([]);
  const [selectedClass,   setSelectedClass]   = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [term,            setTerm]            = useState("");
  const [session,         setSession]         = useState("");
  const [students,        setStudents]        = useState([]);
  const [scores,          setScores]          = useState({});
  const [prevAverages,    setPrevAverages]    = useState({}); // { studentId: { firstTerm, secondTerm } }
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [toast,           setToast]           = useState(null);

  // ── Load teacher profile + assignments ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
      try {
        const [profileRes, assignmentsRes] = await Promise.all([
          fetch(`${API}/api/users/profile`, { headers }),
          fetch(`${API}/api/assignments/my`, { headers }),
        ]);
        if (!profileRes.ok) throw new Error("Failed to load profile");
        const profileData     = await profileRes.json();
        const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : [];
        setProfile(profileData);
        if (Array.isArray(assignmentsData)) setAssignments(assignmentsData);
      } catch {
        showToast("error", "Failed to load teacher information.");
      }
    };
    loadData();
  }, []);

  // ── Dropdown options ──
  const classOptions = (() => {
    const fromArray       = Array.isArray(profile?.assignedClasses) ? profile.assignedClasses.map((c) => c?.trim()).filter(Boolean) : [];
    const fromSingle      = profile?.assignedClass ? [profile.assignedClass.trim()] : [];
    const fromAssignments = Array.isArray(assignments) ? assignments.flatMap((a) => Array.isArray(a.classLevels) ? a.classLevels : []) : [];
    return [...new Set([...fromArray, ...fromSingle, ...fromAssignments.map((c) => c?.trim()).filter(Boolean)])];
  })();

  const subjectOptions = (() => {
    const fromProfile     = profile?.subject ? profile.subject.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const fromAssignments = Array.isArray(assignments) ? assignments.map((a) => a.subject?.trim()).filter(Boolean) : [];
    return [...new Set([...fromProfile, ...fromAssignments])];
  })();

  // ── Score fields for selected term ──
  const scoreFields = term ? TERM_FIELDS[term] ?? [] : [];

  // ── Load students when filters ready ──
  useEffect(() => {
    if (!selectedClass || !term || !session) { setStudents([]); return; }
    setLoadingStudents(true);
    const token = localStorage.getItem("token");

    fetch(`${API}/api/students?classLevel=${selectedClass}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(async (data) => {
        const list = Array.isArray(data) ? data : [];
        setStudents(list);
        setScores({});

        // ── Fetch carry-forward averages for 2nd and 3rd term ──
        if ((term === "2nd Term" || term === "3rd Term") && list.length) {
          const prevData = {};
          await Promise.all(
            list.map(async (student) => {
              const entry = { firstTerm: null, secondTerm: null };
              try {
                if (term === "2nd Term" || term === "3rd Term") {
                  const r1 = await fetch(
                    `${API}/api/results?student=${student._id}&term=1st+Term&session=${encodeURIComponent(session)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (r1.ok) {
                    const d1 = await r1.json();
                    const result1 = Array.isArray(d1) ? d1[0] : d1;
                    entry.firstTerm = result1?.average ?? null;
                  }
                }
                if (term === "3rd Term") {
                  const r2 = await fetch(
                    `${API}/api/results?student=${student._id}&term=2nd+Term&session=${encodeURIComponent(session)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (r2.ok) {
                    const d2 = await r2.json();
                    const result2 = Array.isArray(d2) ? d2[0] : d2;
                    entry.secondTerm = result2?.average ?? null;
                  }
                }
              } catch {}
              prevData[student._id] = entry;
            })
          );
          setPrevAverages(prevData);
        } else {
          setPrevAverages({});
        }
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
    return scoreFields.reduce((sum, f) => sum + (Number(s[f.key]) || 0), 0);
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
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
           body: JSON.stringify({
            studentId: student._id,
            subject: selectedSubject,
            classLevel: selectedClass,
            term,
            session,
            hwk: Number(s.hwk) || 0,
            cf: Number(s.cf) || 0,
            ca1: Number(s.ca1) || 0,
            ca2: Number(s.ca2) || 0,
            exam: Number(s.exam) || 0,

            firstTermAverage: Number(s.firstTermAverage) || null,
            secondTermAverage: Number(s.secondTermAverage) || null,
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
  const showPrevTerms   = term === "2nd Term" || term === "3rd Term";

  // ── Column headers ──
  const tableHeaders = [
    "Student",
    ...scoreFields.map((f) => `${f.label} /${f.max}`),
    "Total /90",
    "%",
    "Grade",
    ...(term === "2nd Term" ? ["1st Term Avg"] : []),
    ...(term === "3rd Term" ? ["1st Term Avg", "2nd Term Avg"] : []),
  ];

  // Grid columns: student + score fields + total + % + grade + carry-forward cols
  const extraCols = term === "3rd Term" ? 2 : term === "2nd Term" ? 1 : 0;
  const gridCols  = `2fr repeat(${scoreFields.length}, 1fr) 1fr 1fr 1fr${extraCols > 0 ? ` repeat(${extraCols}, 1fr)` : ""}`;

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
          <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-jost font-bold text-gray-800 text-2xl">Upload Subject Scores</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  Enter scores for your assigned subject and class
                </p>
              </div>
              {filtersComplete && students.length > 0 && (
                <button onClick={handleSaveAll} disabled={saving}
                  className="flex items-center gap-2 font-jost font-semibold px-6 py-2.5 rounded-full
                             bg-[#f056f0] hover:bg-[#525fe1] text-white text-sm
                             transition-colors duration-300 shadow-sm disabled:opacity-50">
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><FiCheck className="text-base" /> Save All Scores</>}
                </button>
              )}
            </div>

            {profile && classOptions.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 font-dm-sans text-sm
                              px-5 py-3 rounded-2xl flex items-center gap-2">
                <FiAlertCircle /> You have no class assigned yet. Contact admin to assign you a class.
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
                    <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5
                                 font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0] bg-white pr-9">
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
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5
                                 font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0] bg-white pr-9">
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
                    <select value={term} onChange={(e) => { setTerm(e.target.value); setScores({}); }}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5
                                 font-dm-sans text-sm text-gray-700 focus:outline-none focus:border-[#f056f0] bg-white pr-9">
                      <option value="">Select term</option>
                      {TERMS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Session */}
                <div className="flex flex-col gap-1">
                  <label className="font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide">Session</label>
                  <input type="text" value={session} onChange={(e) => setSession(e.target.value)}
                    placeholder="e.g. 2024/2025"
                    className="border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm
                               text-gray-700 focus:outline-none focus:border-[#f056f0] placeholder-gray-300" />
                </div>
              </div>

              {/* Term info banner */}
              {term && (
                <div className="mt-4 px-4 py-2.5 bg-[#f056f0]/5 border border-[#f056f0]/20 rounded-xl">
                  <p className="font-dm-sans text-xs text-[#f056f0] font-semibold">
                    {term} scoring: HWK (10) + CA1 (10) + CA2 (10) + Exam (60) = 90
                    {term === "2nd Term" && " · 1st Term average will be shown"}
                    {term === "3rd Term" && " · 1st & 2nd Term averages will be shown"}
                  </p>
                </div>
              )}
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
                    {/* Table header */}
                    <div className="overflow-x-auto">
                      <div className="min-w-max">
                        <div className="grid gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100"
                          style={{ gridTemplateColumns: gridCols }}>
                          {tableHeaders.map((h, i) => (
                            <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </span>
                          ))}
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-50">
                          {students.map((student) => {
                            const s      = scores[student._id] || {};
                            const total  = getTotal(student._id);
                            const pct    = ((total / MAX_TOTAL) * 100).toFixed(1);
                            const { grade, color } = gradeInfo(total);
                            const prev   = prevAverages[student._id] || {};

                            return (
                              <div key={student._id}
                                className="grid gap-2 px-6 py-3 items-center hover:bg-[#fdf8ff] transition-colors"
                                style={{ gridTemplateColumns: gridCols }}>

                                {/* Student name */}
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
                                  <p className="font-dm-sans text-sm font-semibold text-gray-700 whitespace-nowrap">
                                    {student.firstName} {student.lastName}
                                  </p>
                                </div>

                                {/* Score inputs */}
                                {scoreFields.map((f) => (
                                  <input key={f.key}
                                    type="number" min={0} max={f.max}
                                    value={s[f.key] ?? ""}
                                    onChange={(e) => handleScore(student._id, f.key, e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-center
                                               font-dm-sans text-sm text-gray-700 focus:outline-none
                                               focus:border-[#f056f0] transition-colors" />
                                ))}

                                {/* Total */}
                                <div className="text-center">
                                  <span className="font-jost font-bold text-gray-700 text-sm">{total}</span>
                                </div>

                                {/* % */}
                                <div className="text-center">
                                  <span className="font-dm-sans text-sm text-gray-500">{pct}%</span>
                                </div>

                                {/* Grade */}
                                <div className="text-center">
                                  <span className={`font-jost font-black text-lg ${color}`}>{grade}</span>
                                </div>

                                {/* 1st Term carry-forward */}
                       {(term === "2nd Term" || term === "3rd Term") && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={s.firstTermAverage ?? ""}
                        onChange={(e) =>
                          setScores((prev) => ({
                            ...prev,
                            [student._id]: {
                              ...prev[student._id],
                              firstTermAverage: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-center"
                      />
                    )}

                    {term === "3rd Term" && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={s.secondTermAverage ?? ""}
                        onChange={(e) =>
                          setScores((prev) => ({
                            ...prev,
                            [student._id]: {
                              ...prev[student._id],
                              secondTermAverage: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-center"
                      />
                    )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                      <button onClick={handleSaveAll} disabled={saving}
                        className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full
                                   bg-[#f056f0] hover:bg-[#525fe1] text-white text-sm
                                   transition-colors disabled:opacity-50">
                        {saving
                          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                          : <><FiCheck /> Save All Scores</>}
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
          {toast.type === "success" ? <FiCheck /> : <FiAlertCircle />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}