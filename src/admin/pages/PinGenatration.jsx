import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { useState, useEffect } from "react";
import { FaKey, FaCopy, FaDownload, FaRedo, FaCheckCircle } from "react-icons/fa";

const API      = "https://royalgemschoolsbackend.vercel.app";
const classes  = ["All Classes", "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
const sessions = ["2023/2024", "2024/2025", "2025/2026"];
const terms    = ["1st Term", "2nd Term", "3rd Term"];
const pinTypes = ["Single Student", "Entire Class"];

const GeneratePin = () => {
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [filterClass,     setFilterClass]     = useState("All Classes");
  const [pinType,         setPinType]         = useState("Single Student");
  const [selectedId,      setSelectedId]      = useState("");
  const [term,            setTerm]            = useState("");
  const [session,         setSession]         = useState("");
  const [pinLength,       setPinLength]       = useState("8");
  const [generated,       setGenerated]       = useState(false);
  const [copied,          setCopied]          = useState(null);
  const [pins,            setPins]            = useState([]);
  const [students,        setStudents]        = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  const inputClass = `w-full border border-gray-200 rounded-lg px-4 py-2.5
                      font-dm-sans text-gray-700 text-sm placeholder-gray-300
                      focus:outline-none focus:border-[#A033A0] transition-colors duration-300`;
  const labelClass = `font-dm-sans text-[#A033A0] text-sm font-semibold mb-1 block`;

  // ── Fetch students whenever class filter changes ──
  // Uses classLevel= to match backend query param name
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      setStudents([]);
      try {
        const token = localStorage.getItem("token");
        const query =
          filterClass !== "All Classes"
            ? `?classLevel=${encodeURIComponent(filterClass)}`
            : "";

        const res  = await fetch(`${API}/api/pins/students${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchStudents error:", err.message);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [filterClass]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");

    if (!term || !session) {
      setError("Please select both term and session.");
      return;
    }
    if (pinType === "Single Student" && !selectedId) {
      setError("Please select a student.");
      return;
    }
    if (pinType === "Entire Class" && filterClass === "All Classes") {
      setError("Please select a specific class to generate PINs for.");
      return;
    }
    if (pinType === "Entire Class" && students.length === 0) {
      setError("No students found in the selected class.");
      return;
    }

    setLoading(true);
    try {
      const token      = localStorage.getItem("token");
      const studentIds =
        pinType === "Single Student"
          ? [selectedId]
          : students.map(s => s._id);

      const res  = await fetch(`${API}/api/pins/generate`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentIds,
          term,
          session,
          pinLength: Number(pinLength),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate PINs");

      setPins(data.pins);
      setGenerated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (pin, idx) => {
    navigator.clipboard.writeText(pin);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    const all = pins.map(p => `${p.name} (${p.reg}): ${p.pin}`).join("\n");
    navigator.clipboard.writeText(all);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = () => {
    const content = pins
      .map(
        p =>
          `Name: ${p.name}\nReg No: ${p.reg}\nClass: ${p.class}\nPIN: ${p.pin}\nTerm: ${p.term}\nSession: ${p.session}\n`
      )
      .join("\n---\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `PINs_${term}_${session}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setGenerated(false);
    setPins([]);
    setSelectedId("");
    setTerm("");
    setSession("");
    setError("");
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
          <form onSubmit={handleGenerate} className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-dm-sans">
                {error}
              </div>
            )}

            {/* ── Section 1: PIN Configuration ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                PIN Configuration
              </h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 flex-[2] min-w-[180px]">
                  <label className={labelClass}>PIN Type *</label>
                  <select value={pinType}
                    onChange={e => { setPinType(e.target.value); setGenerated(false); setPins([]); }}
                    className={inputClass}>
                    {pinTypes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                  <label className={labelClass}>PIN Length</label>
                  <select value={pinLength} onChange={e => setPinLength(e.target.value)} className={inputClass}>
                    {["6", "8", "10", "12"].map(l => (
                      <option key={l} value={l}>{l} characters</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 2: Select Student / Class ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                {pinType === "Single Student" ? "Select Student" : "Select Class"}
              </h2>

              <div className="flex flex-wrap gap-3">
                {/* Class filter */}
                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                  <label className={labelClass}>Filter by Class</label>
                  <select value={filterClass}
                    onChange={e => { setFilterClass(e.target.value); setSelectedId(""); }}
                    className={inputClass}>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Single student picker */}
                {pinType === "Single Student" && (
                  <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
                    <label className={labelClass}>
                      Student *
                      {loadingStudents && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">Loading...</span>
                      )}
                    </label>
                    <select value={selectedId}
                      onChange={e => setSelectedId(e.target.value)}
                      className={inputClass}
                      disabled={loadingStudents}>
                      <option value="">
                        {loadingStudents
                          ? "Loading students..."
                          : students.length === 0
                          ? "No students found"
                          : "-- Select Student --"}
                      </option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.firstName} {s.lastName} — {s.regNumber} ({s.classLevel})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Entire class info */}
                {pinType === "Entire Class" && (
                  <div className="flex items-end pb-1">
                    <p className="font-dm-sans text-sm text-gray-500">
                      {loadingStudents
                        ? "Loading students..."
                        : `${students.length} student${students.length !== 1 ? "s" : ""} in ${
                            filterClass === "All Classes" ? "all classes" : filterClass
                          }`}
                    </p>
                  </div>
                )}
              </div>

              {/* Term + Session */}
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Term *</label>
                  <select value={term} onChange={e => setTerm(e.target.value)} className={inputClass}>
                    <option value="">Select Term</option>
                    {terms.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Session *</label>
                  <select value={session} onChange={e => setSession(e.target.value)} className={inputClass}>
                    <option value="">Select Session</option>
                    {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 3: Generated PINs ── */}
            {generated && pins.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="font-jost font-bold text-gray-800 text-lg">
                    Generated PINs
                    <span className="ml-2 text-sm font-dm-sans font-normal text-gray-400">
                      ({pins.length} PIN{pins.length > 1 ? "s" : ""})
                    </span>
                  </h2>
                  <button type="button" onClick={handleCopyAll}
                    className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-[#A033A0] hover:text-[#525fe1] transition-colors">
                    {copied === "all"
                      ? <><FaCheckCircle className="text-green-500" /> Copied!</>
                      : <><FaCopy className="text-xs" /> Copy All</>}
                  </button>
                </div>

                <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_auto] gap-3">
                  {["Reg No.", "Student Name", "Class", "PIN", ""].map((h, i) => (
                    <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  {pins.map((p, i) => (
                    <div key={i}
                      className="grid grid-cols-1 md:grid-cols-[auto_2fr_1fr_1fr_auto] gap-3 items-center bg-[#faf5ff] rounded-xl px-4 py-3 border border-[#f0e0f0]">
                      <span className="font-dm-sans text-xs text-gray-400">{p.reg}</span>
                      <span className="font-dm-sans text-sm font-semibold text-gray-700">{p.name}</span>
                      <span className="font-dm-sans text-sm text-gray-500">{p.class}</span>
                      <span className="font-jost font-bold text-[#A033A0] tracking-widest text-sm">{p.pin}</span>
                      <button type="button" onClick={() => handleCopy(p.pin, i)}
                        className="text-gray-400 hover:text-[#A033A0] transition-colors flex items-center justify-center">
                        {copied === i
                          ? <FaCheckCircle className="text-green-500 text-sm" />
                          : <FaCopy className="text-sm" />}
                      </button>
                    </div>
                  ))}
                </div>

                <p className="font-dm-sans text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
                  ⚠️ These PINs are single-use. Share them securely with each student or parent.
                </p>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              {generated ? (
                <>
                  <button type="button" onClick={handleReset}
                    className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:border-[#A033A0] hover:text-[#A033A0] transition-all duration-300">
                    <FaRedo className="text-xs" /> Reset
                  </button>
                  <button type="button" onClick={handleDownload}
                    className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full border border-[#A033A0] text-[#A033A0] hover:bg-[#faf5ff] transition-all duration-300">
                    <FaDownload className="text-xs" /> Download PINs
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full bg-[#A033A0] hover:bg-[#525fe1] text-white transition-colors duration-500 disabled:opacity-50">
                    <FaRedo className="text-xs" /> Regenerate
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={handleReset}
                    className="font-jost font-semibold px-8 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:border-[#A033A0] hover:text-[#A033A0] transition-all duration-300">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full bg-[#A033A0] hover:bg-[#525fe1] text-white transition-colors duration-500 disabled:opacity-50">
                    <FaKey className="text-xs" />
                    {loading ? "Generating..." : "Generate PIN"}
                  </button>
                </>
              )}
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default GeneratePin;