import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaGraduationCap, FaCheckCircle } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getScholarships, previewAward, awardScholarship } from "../../services/scholarshipApi";

const API = import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app";
const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const inputClass = `w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                    placeholder-gray-300 focus:outline-none focus:border-[#f056f0] transition-colors bg-white`;
const labelClass = `font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block`;

export default function AwardScholarship() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const hasFetched    = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Step 1 — student search
  const [studentSearch,  setStudentSearch]  = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [selectedStudent,  setSelectedStudent]  = useState(null);

  // Step 2 — scholarship selection
  const [scholarships,      setScholarships]      = useState([]);
  const [selectedScholarship, setSelectedScholarship] = useState(params.get("sch") || "");

  // Step 3 — preview
  const [preview,    setPreview]    = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Form
  const [feeStatementId, setFeeStatementId] = useState("");
  const [feeStatements,  setFeeStatements]  = useState([]);
  const [effectiveDate,  setEffectiveDate]  = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate,     setExpiryDate]     = useState("");
  const [session,        setSession]        = useState("");
  const [reason,         setReason]         = useState("");

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // Load scholarships on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getScholarships({ status: "Active", limit: 100 })
      .then(data => setScholarships(data.scholarships ?? []))
      .catch(() => {});
  }, []);

  // Search students
  const searchStudents = async () => {
    if (!studentSearch.trim()) return;
    setSearchingStudent(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API}/api/students?search=${encodeURIComponent(studentSearch)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudentResults(Array.isArray(data) ? data : []);
    } catch {}
    setSearchingStudent(false);
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setStudentResults([]);
    setStudentSearch("");
    // Load student's fee statements
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API}/api/fees?student=${student._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeeStatements(Array.isArray(data) ? data : []);
    } catch {}
  };

  // Load preview when scholarship or feeStatement changes
  useEffect(() => {
    if (!selectedStudent || !selectedScholarship) { setPreview(null); return; }
    setLoadingPreview(true);
    previewAward({ studentId: selectedStudent._id, scholarshipId: selectedScholarship, feeStatementId: feeStatementId || undefined })
      .then(data => setPreview(data.preview))
      .catch(() => setPreview(null))
      .finally(() => setLoadingPreview(false));
  }, [selectedStudent, selectedScholarship, feeStatementId]);

  const handleAward = async (e) => {
    e.preventDefault();
    if (!selectedStudent)    { setError("Please select a student"); return; }
    if (!selectedScholarship){ setError("Please select a scholarship"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      await awardScholarship({
        studentId:      selectedStudent._id,
        scholarshipId:  selectedScholarship,
        feeStatementId: feeStatementId || undefined,
        effectiveDate,
        expiryDate:     expiryDate || undefined,
        session,
        reason,
      });
      setSuccess("Scholarship awarded successfully!");
      setTimeout(() => navigate("/admin/scholarships/beneficiaries"), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
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
          <form onSubmit={handleAward} className="max-w-3xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <button type="button" onClick={() => navigate("/admin/scholarships")}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f056f0] mb-3 transition-colors">
                <FaArrowLeft /> Back
              </button>
              <h1 className="font-jost font-bold text-2xl text-gray-800">Award Scholarship</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">Assign a scholarship to a student.</p>
            </div>

            {/* Step 1 — Student */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">
                Step 1 — Select Student
              </h2>

              {!selectedStudent ? (
                <>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                      <input type="text" value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), searchStudents())}
                        placeholder="Search by name or reg number..."
                        className={`${inputClass} pl-9`} />
                    </div>
                    <button type="button" onClick={searchStudents} disabled={searchingStudent}
                      className="px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                                 font-dm-sans text-sm font-semibold transition-colors disabled:opacity-50">
                      {searchingStudent ? "Searching..." : "Search"}
                    </button>
                  </div>

                  {studentResults.length > 0 && (
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      {studentResults.map(s => (
                        <button key={s._id} type="button" onClick={() => selectStudent(s)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fdf8ff]
                                     transition-colors border-b border-gray-50 last:border-b-0 text-left">
                          {s.profilePhoto ? (
                            <img src={s.profilePhoto} alt=""
                              className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                              <span className="font-jost font-bold text-[#f056f0] text-xs">
                                {s.firstName?.[0]}{s.lastName?.[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-dm-sans font-semibold text-gray-700 text-sm">
                              {s.firstName} {s.lastName}
                            </p>
                            <p className="font-dm-sans text-xs text-gray-400">
                              {s.regNumber} · {s.classLevel}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  {selectedStudent.profilePhoto ? (
                    <img src={selectedStudent.profilePhoto} alt=""
                      className="w-12 h-12 rounded-full object-cover border border-white flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-jost font-bold text-[#f056f0]">
                        {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-dm-sans font-bold text-gray-700">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                    <p className="font-dm-sans text-xs text-gray-500">
                      {selectedStudent.regNumber} · {selectedStudent.classLevel} · {selectedStudent.gender}
                    </p>
                  </div>
                  <button type="button" onClick={() => { setSelectedStudent(null); setFeeStatements([]); setPreview(null); }}
                    className="font-dm-sans text-xs text-[#f056f0] hover:underline">Change</button>
                </div>
              )}
            </div>

            {/* Step 2 — Scholarship */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">
                Step 2 — Select Scholarship
              </h2>
              <div>
                <label className={labelClass}>Scholarship *</label>
                <select value={selectedScholarship} onChange={e => setSelectedScholarship(e.target.value)}
                  required className={`${inputClass} appearance-none`}>
                  <option value="">— Select scholarship —</option>
                  {scholarships.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.scholarshipName} — {s.discountType === "percentage" ? `${s.discountValue}%` : fmt(s.discountValue)} off
                      {s.maxBeneficiaries ? ` (${s.currentBeneficiaries}/${s.maxBeneficiaries} slots)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee statement link */}
              {feeStatements.length > 0 && (
                <div>
                  <label className={labelClass}>Link to Fee Statement (optional)</label>
                  <select value={feeStatementId} onChange={e => setFeeStatementId(e.target.value)}
                    className={`${inputClass} appearance-none`}>
                    <option value="">— No specific fee statement —</option>
                    {feeStatements.map(f => (
                      <option key={f._id} value={f._id}>
                        {f.term} · {f.session} — {fmt(f.amountDue)} ({f.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preview */}
              {loadingPreview && (
                <div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
              )}
              {preview && !loadingPreview && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Original Fees",    value: fmt(preview.originalFees),    color: "text-gray-700"    },
                    { label: "Scholarship Disc.", value: `-${fmt(preview.discountAmount)}`, color: "text-emerald-600" },
                    { label: "Remaining Balance", value: fmt(preview.remainingBalance), color: "text-[#f056f0]"  },
                  ].map(c => (
                    <div key={c.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="font-dm-sans text-xs text-gray-400 mb-1">{c.label}</p>
                      <p className={`font-jost font-bold text-lg ${c.color}`}>{c.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3 — Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">
                Step 3 — Assignment Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Effective Date</label>
                  <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                    placeholder="Defaults to scholarship end date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Session</label>
                  <input type="text" value={session} onChange={e => setSession(e.target.value)}
                    placeholder="e.g. 2024/2025" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Reason</label>
                  <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Academic excellence" className={inputClass} />
                </div>
              </div>
            </div>

            {error   && <div className="bg-red-50 border border-red-200 text-red-500 px-5 py-3 rounded-xl font-dm-sans text-sm">{error}</div>}
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-5 py-3 rounded-xl font-dm-sans text-sm flex items-center gap-2">
                <FaCheckCircle /> {success}
              </div>
            )}

            <div className="flex justify-end gap-4 pb-8">
              <button type="button" onClick={() => navigate("/admin/scholarships")}
                className="px-8 py-2.5 rounded-full border border-gray-300 font-jost font-semibold text-gray-600
                           hover:border-[#f056f0] hover:text-[#f056f0] transition-all">Cancel</button>
              <button type="submit" disabled={saving || !selectedStudent || !selectedScholarship}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-jost font-semibold text-white
                            transition-colors
                            ${saving || !selectedStudent || !selectedScholarship
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Awarding...</>
                  : <><FaGraduationCap /> Award Scholarship</>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}