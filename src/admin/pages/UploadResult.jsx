import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app";

const classes = ['All Classes', 'Reception 1', 'Reception 2', 'Pre-k', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3']
const terms       = ["1st Term","2nd Term","3rd Term"];
const sessions    = ["2023/2024","2024/2025","2025/2026", "2026/2027 "];
const sortOptions = [
  { value: "name-asc",  label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "class",     label: "Class"       },
  { value: "reg",       label: "Reg No."     },
];

// ── Score fields per term (cwk removed) ──────────────────────
const TERM_FIELDS = {
  "1st Term": [
    { key: "hwk",  label: "HWK",  max: 10, placeholder: "0–10" },
    { key: "ca1",  label: "CA1",  max: 10, placeholder: "0–10" },
    { key: "ca2",  label: "CA2",  max: 10, placeholder: "0–10" },
    { key: "exam", label: "Exam", max: 60, placeholder: "0–60" },
  ],
  "2nd Term": [
    { key: "hwk",  label: "HWK",  max: 10, placeholder: "0–10" },
    { key: "ca1",  label: "CA1",  max: 10, placeholder: "0–10" },
    { key: "ca2",  label: "CA2",  max: 10, placeholder: "0–10" },
    { key: "exam", label: "Exam", max: 60, placeholder: "0–60" },
  ],
  "3rd Term": [
    { key: "hwk",  label: "HWK",  max: 10, placeholder: "0–10" },
    { key: "ca1",  label: "CA1",  max: 10, placeholder: "0–10" },
    { key: "ca2",  label: "CA2",  max: 10, placeholder: "0–10" },
    { key: "exam", label: "Exam", max: 60, placeholder: "0–60" },
  ],
};

const MAX_TOTAL = 90;

const makeDefaultSubject = () => ({ name: "", hwk: "", ca1: "", ca2: "", exam: "" });

const getSubjectTotal = (sub) =>
  (Number(sub.hwk) || 0) + (Number(sub.ca1) || 0) + (Number(sub.ca2) || 0) + (Number(sub.exam) || 0);

const getGrade = (total) => {
  const pct = (total / MAX_TOTAL) * 100;
  if (pct >= 85) return { grade: "A", color: "text-emerald-600" };
  if (pct >= 70) return { grade: "B", color: "text-blue-600"    };
  if (pct >= 60) return { grade: "C", color: "text-indigo-500"  };
  if (pct >= 50) return { grade: "D", color: "text-amber-500"   };
  if (pct >= 40) return { grade: "E", color: "text-orange-500"  };
  return              { grade: "F", color: "text-red-500"      };
};

const DEFAULT_AFFECTIVE = [
  { label: "Punctuality",                    rating: "" },
  { label: "Neatness",                       rating: "" },
  { label: "Comportment in Class",           rating: "" },
  { label: "Organisation",                   rating: "" },
  { label: "Promptness to Complete Work",    rating: "" },
  { label: "Creativity",                     rating: "" },
  { label: "Relationship with Other Pupils", rating: "" },
];

const DEFAULT_PSYCHOMOTOR = [
  { label: "Handwriting",                    rating: "" },
  { label: "Games / Sports",                 rating: "" },
  { label: "Handling of Learning Materials", rating: "" },
  { label: "Public Speaking",                rating: "" },
];

const DEFAULT_INCLUSIVE = [
  { label: "Practical Life Exercise", rating: "" },
  { label: "Reading",                 rating: "" },
  { label: "Circle Time",             rating: "" },
];

const UploadResult = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Student selection ──
  const [filterClass, setFilterClass] = useState("All Classes");
  const [sortBy,      setSortBy]      = useState("name-asc");
  const [student,     setStudent]     = useState("");
  const [term,        setTerm]        = useState("");
  const [session,     setSession]     = useState("");

  // ── Subjects ──
  const [subjects, setSubjects] = useState([makeDefaultSubject()]);

  // ── Attendance ──
  const [timesSchoolOpened,       setTimesSchoolOpened]       = useState("");
  const [timesPresent,            setTimesPresent]            = useState("");
  const [numberOfStudentsInClass, setNumberOfStudentsInClass] = useState("");

  // ── Dispositions ──
  const [affective,   setAffective]   = useState(DEFAULT_AFFECTIVE.map(d => ({ ...d })));
  const [psychomotor, setPsychomotor] = useState(DEFAULT_PSYCHOMOTOR.map(d => ({ ...d })));
  const [inclusive,   setInclusive]   = useState(DEFAULT_INCLUSIVE.map(d => ({ ...d })));

  // ── Remarks ──
  const [teacherRemark,  setTeacherRemark]  = useState("");
  const [headRemark,     setHeadRemark]     = useState("");
  const [nextTermBegins, setNextTermBegins] = useState("");

  // ── Students list ──
  const [students,        setStudents]        = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── Previous term averages (for display) ──
  const [prevAverages, setPrevAverages] = useState({ firstTerm: null, secondTerm: null });
  const [loadingPrev,  setLoadingPrev]  = useState(false);

  // ── Submission ──
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  // ── Fetch students ──
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students:", err.message);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // ── Fetch previous term averages when student + term + session change ──
  useEffect(() => {
    if (!student || !term || !session) {
      setPrevAverages({ firstTerm: null, secondTerm: null });
      return;
    }
    if (term === "1st Term") {
      setPrevAverages({ firstTerm: null, secondTerm: null });
      return;
    }

    const fetchPrev = async () => {
      setLoadingPrev(true);
      const token   = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const entry   = { firstTerm: null, secondTerm: null };

      try {
        if (term === "2nd Term" || term === "3rd Term") {
          const r1 = await fetch(
            `${API}/api/results/${student}?term=1st+Term&session=${encodeURIComponent(session)}`,
            { headers }
          );
          if (r1.ok) {
            const d1 = await r1.json();
            entry.firstTerm = d1?.average ?? null;
          }
        }
        if (term === "3rd Term") {
          const r2 = await fetch(
            `${API}/api/results/${student}?term=2nd+Term&session=${encodeURIComponent(session)}`,
            { headers }
          );
          if (r2.ok) {
            const d2 = await r2.json();
            entry.secondTerm = d2?.average ?? null;
          }
        }
      } catch {}

      setPrevAverages(entry);
      setLoadingPrev(false);
    };

    fetchPrev();
  }, [student, term, session]);

  const filteredStudents = students
    .filter(s => filterClass === "All Classes" ? true : s.classLevel === filterClass)
    .sort((a, b) => {
      if (sortBy === "name-asc")  return a.firstName.localeCompare(b.firstName);
      if (sortBy === "name-desc") return b.firstName.localeCompare(a.firstName);
      if (sortBy === "class")     return a.classLevel.localeCompare(b.classLevel);
      if (sortBy === "reg")       return a.regNumber.localeCompare(b.regNumber);
      return 0;
    });

  // ── Subject helpers ──
  const addSubject    = () => setSubjects([...subjects, makeDefaultSubject()]);
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i, field, value) => {
    const updated = [...subjects];
    updated[i][field] = value;
    setSubjects(updated);
  };

  // ── Disposition helpers ──
  const updateRating = (setter, index, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], rating: value };
      return updated;
    });
  };

  // ── Active score fields for current term ──
  const scoreFields = term ? (TERM_FIELDS[term] ?? []) : TERM_FIELDS["1st Term"];

  // ── Computed summary ──
  const subjectTotals = subjects.map(getSubjectTotal);
  const grandTotal    = subjectTotals.reduce((s, t) => s + t, 0);
  const average       = subjects.length > 0 ? grandTotal / subjects.length : 0;
  const averagePct    = ((average / MAX_TOTAL) * 100).toFixed(2);

  // ── Reset ──
  const resetForm = () => {
    setStudent(""); setTerm(""); setSession("");
    setSubjects([makeDefaultSubject()]);
    setTimesSchoolOpened(""); setTimesPresent(""); setNumberOfStudentsInClass("");
    setAffective(DEFAULT_AFFECTIVE.map(d => ({ ...d })));
    setPsychomotor(DEFAULT_PSYCHOMOTOR.map(d => ({ ...d })));
    setInclusive(DEFAULT_INCLUSIVE.map(d => ({ ...d })));
    setTeacherRemark(""); setHeadRemark(""); setNextTermBegins("");
    setError(""); setSuccess(""); setPrevAverages({ firstTerm: null, secondTerm: null });
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        studentId: student,
        term,
        session,
        // Send only the fields for this term — no cwk
        subjects: subjects.map(s => ({
          name: s.name,
          hwk:  Number(s.hwk)  || 0,
          ca1:  Number(s.ca1)  || 0,
          ca2:  Number(s.ca2)  || 0,
          exam: Number(s.exam) || 0,
        })),
        timesSchoolOpened:           Number(timesSchoolOpened)       || 0,
        timesPresent:                Number(timesPresent)            || 0,
        numberOfStudentsInClass:     Number(numberOfStudentsInClass) || 0,
        affectiveDispositions:       affective.map(d => ({ label: d.label,  rating: Number(d.rating) || null })),
        psychomotorDispositions:     psychomotor.map(d => ({ label: d.label, rating: Number(d.rating) || null })),
        inclusiveLearningActivities: inclusive.map(d => ({ label: d.label,  rating: Number(d.rating) || null })),
        teacherRemark,
        headRemark,
        nextTermBegins,
      };

      const res  = await fetch(`${API}/api/results`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Result uploaded successfully!");
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ──
  const inputClass   = `w-full border border-gray-200 rounded-lg px-4 py-2.5 font-dm-sans text-gray-700 text-sm placeholder-gray-300 focus:outline-none focus:border-[#f056f0] transition-colors duration-300`;
  const labelClass   = `font-dm-sans text-[#f056f0] text-sm font-semibold mb-1 block`;
  const sectionClass = `bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4`;
  const headingClass = `font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3`;

  const RatingInput = ({ value, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputClass}>
      <option value="">—</option>
      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
    </select>
  );

  const DispositionTable = ({ title, data, setter }) => (
    <div className="flex flex-col gap-3">
      <h3 className="font-dm-sans text-gray-500 text-xs font-semibold uppercase tracking-widest">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="font-dm-sans text-gray-700 text-sm flex-1">{item.label}</span>
            <div className="w-24">
              <RatingInput value={item.rating} onChange={val => updateRating(setter, i, val)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Grid cols: Subject Name + score fields + Total + Grade + delete
  const gridCols = `2fr ${scoreFields.map(() => "1fr").join(" ")} 1fr 1fr auto`;

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
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

            {/* ── 1. Select Student ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Select Student</h2>

              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                  <label className={labelClass}>Filter by Class</label>
                  <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className={inputClass}>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                  <label className={labelClass}>Sort By</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inputClass}>
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
                  <label className={labelClass}>Student *</label>
                  <select value={student} onChange={e => setStudent(e.target.value)} className={inputClass} required>
                    <option value="">
                      {loadingStudents ? "Loading..." : `-- Select Student (${filteredStudents.length} available) --`}
                    </option>
                    {filteredStudents.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} — {s.classLevel} ({s.regNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Term *</label>
                  <select value={term} onChange={e => { setTerm(e.target.value); setSubjects([makeDefaultSubject()]); }} className={inputClass} required>
                    <option value="">Select Term</option>
                    {terms.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Session *</label>
                  <select value={session} onChange={e => setSession(e.target.value)} className={inputClass} required>
                    <option value="">Select Session</option>
                    {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Term info banner */}
              {term && (
                <div className="px-4 py-2.5 bg-[#f056f0]/5 border border-[#f056f0]/20 rounded-xl">
                  <p className="font-dm-sans text-xs text-[#f056f0] font-semibold">
                    {term} scoring: HWK (10) + CA1 (10) + CA2 (10) + Exam (60) = 90
                    {term === "2nd Term" && " · 1st Term average shown below"}
                    {term === "3rd Term" && " · 1st & 2nd Term averages shown below"}
                  </p>
                </div>
              )}

              {/* Carry-forward averages */}
              {(term === "2nd Term" || term === "3rd Term") && student && session && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {loadingPrev ? (
                    <div className="col-span-3 flex items-center gap-2 text-gray-400 text-sm font-dm-sans">
                      <span className="w-4 h-4 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin" />
                      Loading previous term averages…
                    </div>
                  ) : (
                    <>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                        <p className="font-dm-sans text-xs text-indigo-400 font-semibold">1st Term Average</p>
                        <p className="font-jost font-bold text-indigo-700 text-xl mt-1">
                          {prevAverages.firstTerm != null ? `${Number(prevAverages.firstTerm).toFixed(2)}/90` : "Not found"}
                        </p>
                      </div>
                      {term === "3rd Term" && (
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                          <p className="font-dm-sans text-xs text-purple-400 font-semibold">2nd Term Average</p>
                          <p className="font-jost font-bold text-purple-700 text-xl mt-1">
                            {prevAverages.secondTerm != null ? `${Number(prevAverages.secondTerm).toFixed(2)}/90` : "Not found"}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── 2. Attendance & Class Info ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Attendance & Class Info</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Times School Opened", value: timesSchoolOpened,       setter: setTimesSchoolOpened       },
                  { label: "Times Present",        value: timesPresent,            setter: setTimesPresent            },
                  { label: "No. in Class",         value: numberOfStudentsInClass, setter: setNumberOfStudentsInClass },
                ].map(({ label, value, setter }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <label className={labelClass}>{label}</label>
                    <input type="number" min={0} value={value} onChange={e => setter(e.target.value)}
                      placeholder="0" className={inputClass} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── 3. Subjects & Scores ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Subjects & Scores</h2>

              {/* Column headers */}
              <div className="hidden md:grid gap-3 items-center" style={{ gridTemplateColumns: gridCols }}>
                <span className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">Subject Name *</span>
                {scoreFields.map(f => (
                  <span key={f.key} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">
                    {f.label} (0–{f.max})
                  </span>
                ))}
                <span className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">Total /90</span>
                <span className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">Grade</span>
                <span />
              </div>

              {/* Subject rows */}
              <div className="flex flex-col gap-3">
                {subjects.map((sub, i) => {
                  const total           = getSubjectTotal(sub);
                  const { grade, color } = getGrade(total);
                  return (
                    <div key={i} className="grid grid-cols-1 gap-3 items-center md:grid"
                      style={{ gridTemplateColumns: window.innerWidth >= 768 ? gridCols : "1fr" }}>
                      <input type="text" placeholder="e.g. Mathematics"
                        value={sub.name} onChange={e => updateSubject(i, "name", e.target.value)}
                        className={inputClass} required />

                      {scoreFields.map(f => (
                        <input key={f.key} type="number" placeholder={f.placeholder}
                          min={0} max={f.max}
                          value={sub[f.key]}
                          onChange={e => updateSubject(i, f.key, e.target.value)}
                          className={inputClass} required />
                      ))}

                      {/* Live total */}
                      <div className="flex items-center justify-center">
                        <span className="font-jost font-bold text-gray-700">{total}</span>
                      </div>

                      {/* Live grade */}
                      <div className="flex items-center justify-center">
                        <span className={`font-jost font-black text-lg ${color}`}>{grade}</span>
                      </div>

                      <button type="button" onClick={() => removeSubject(i)} disabled={subjects.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-20 transition-colors flex items-center justify-center">
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button type="button" onClick={addSubject}
                className="flex items-center gap-2 text-[#f056f0] hover:text-[#525fe1] font-dm-sans font-semibold text-sm transition-colors w-fit">
                <FaPlus className="text-xs" /> Add Another Subject
              </button>
            </div>

            {/* ── 4. Result Summary ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Result Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="font-dm-sans text-xs text-gray-400 mb-1">Grand Total</p>
                  <p className="font-jost font-bold text-2xl text-[#f056f0]">{grandTotal}</p>
                  <p className="font-dm-sans text-xs text-gray-400">out of {subjects.length * MAX_TOTAL}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="font-dm-sans text-xs text-gray-400 mb-1">Average /90</p>
                  <p className="font-jost font-bold text-2xl text-[#525fe1]">{average.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="font-dm-sans text-xs text-gray-400 mb-1">Average %</p>
                  <p className="font-jost font-bold text-2xl text-indigo-600">{averagePct}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="font-dm-sans text-xs text-gray-400 mb-1">Status</p>
                  <p className={`font-jost font-bold text-2xl ${Number(averagePct) >= 40 ? "text-emerald-600" : "text-red-500"}`}>
                    {Number(averagePct) >= 40 ? "Pass" : "Fail"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 5. Dispositions ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>
                Dispositions & Activities{" "}
                <span className="text-xs font-normal text-gray-400">(Rate 1–5)</span>
              </h2>
              <div className="flex flex-col gap-6">
                <DispositionTable title="Affective Dispositions"        data={affective}   setter={setAffective}   />
                <DispositionTable title="Psychomotor Dispositions"      data={psychomotor} setter={setPsychomotor} />
                <DispositionTable title="Inclusive Learning Activities" data={inclusive}   setter={setInclusive}   />
              </div>
            </div>

            {/* ── 6. Remarks & Next Term ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Remarks & Next Term</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className={labelClass}>Class Teacher's Remark</label>
                  <textarea rows={3} placeholder="Enter teacher's remark..."
                    value={teacherRemark} onChange={e => setTeacherRemark(e.target.value)}
                    className={`${inputClass} resize-none`} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className={labelClass}>Head Teacher's Remark</label>
                  <textarea rows={3} placeholder="Enter head teacher's remark..."
                    value={headRemark} onChange={e => setHeadRemark(e.target.value)}
                    className={`${inputClass} resize-none`} />
                </div>
              </div>
              <div className="flex flex-col gap-1 max-w-xs">
                <label className={labelClass}>Next Term Begins</label>
                <input type="text" placeholder="e.g. Monday, 4th May 2026"
                  value={nextTermBegins} onChange={e => setNextTermBegins(e.target.value)}
                  className={inputClass} />
              </div>
            </div>

            {/* ── Feedback ── */}
            {error   && <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm font-medium font-dm-sans">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium font-dm-sans">{success}</div>}

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              <button type="button" onClick={resetForm}
                className="font-jost font-semibold px-8 py-2.5 rounded-full border border-gray-300 text-gray-600
                           hover:border-[#f056f0] hover:text-[#f056f0] transition-all duration-300">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className={`font-jost font-semibold px-8 py-2.5 rounded-full text-white transition-colors duration-500
                           ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {loading ? "Uploading..." : "Upload Result"}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default UploadResult;