import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import { useState, useRef } from "react";
import { FaPlus, FaTrash, FaUpload, FaTimes } from "react-icons/fa";

const classes  = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3", "Kindergarten", "Nursery 1", "Nursery 2"];
const sessions = ["2023/2024", "2024/2025", "2025/2026"];

const AddYearbookEntry = () => {
  // ── Form state ──
  const [name,        setName]        = useState("");
  const [regNumber,   setRegNumber]   = useState("");
  const [classArm,    setClassArm]    = useState("");
  const [session,     setSession]     = useState("");
  const [quote,       setQuote]       = useState("");
  const [ambition,    setAmbition]    = useState("");
  const [nickname,    setNickname]    = useState("");
  const [isFeatured,  setIsFeatured]  = useState(false);
  const [awards,      setAwards]      = useState([]);
  const [awardInput,  setAwardInput]  = useState("");

  // ── Photo state ──
  const fileRef                           = useRef();
  const [photoFile,    setPhotoFile]      = useState(null);
  const [photoPreview, setPhotoPreview]   = useState(null);
  const [photoUrl,     setPhotoUrl]       = useState("");
  const [uploading,    setUploading]      = useState(false);

  // ── Submission state ──
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  // ── Sidebar ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Shared styles (matches UploadResult) ──
  const inputClass = `w-full border border-gray-200 rounded-lg px-4 py-2.5
                      font-dm-sans text-gray-700 text-sm placeholder-gray-300
                      focus:outline-none focus:border-[#f056f0] transition-colors duration-300`;
  const labelClass  = `font-dm-sans text-[#f056f0] text-sm font-semibold mb-1 block`;
  const sectionClass = `bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4`;
  const headingClass = `font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3`;

  // ── Photo handlers ──
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Photo must be under 3 MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadPhoto = async () => {
    if (!photoFile) return null;
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const fd    = new FormData();
      fd.append("photo", photoFile);
      const res  = await fetch("https://royalgemschoolsbackend.vercel.app/api/yearbook/upload", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPhotoUrl(data.url);
      return data.url;
    } catch (err) {
      setError("Photo upload failed: " + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ── Awards helpers ──
  const addAward = () => {
    const val = awardInput.trim();
    if (!val || awards.includes(val)) return;
    setAwards([...awards, val]);
    setAwardInput("");
  };

  const removeAward = (i) => setAwards(awards.filter((_, idx) => idx !== i));

  // ── Reset ──
  const resetForm = () => {
    setName(""); setRegNumber(""); setClassArm(""); setSession("");
    setQuote(""); setAmbition(""); setNickname(""); setIsFeatured(false);
    setAwards([]); setAwardInput("");
    removePhoto();
    setError(""); setSuccess("");
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");

    try {
      // 1. Upload photo first if one was selected
      let finalPhotoUrl = photoUrl;
      if (photoFile && !photoUrl) {
        const url = await uploadPhoto();
        if (!url) { setLoading(false); return; }
        finalPhotoUrl = url;
      }

      // 2. Create yearbook entry
      const token   = localStorage.getItem("token");
      const payload = {
        name:       name.trim(),
        regNumber:  regNumber.trim().toUpperCase(),
        classArm,
        session,
        quote,
        ambition,
        nickname,
        photo:      finalPhotoUrl || null,
        awards,
        isFeatured,
      };

      const res  = await fetch("https://royalgemschoolsbackend.vercel.app/api/yearbook", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Yearbook entry added successfully!");
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

            {/* ── 1. Student Info ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Student Information</h2>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bella Omoruyi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Nickname</label>
                  <input
                    type="text"
                    placeholder='e.g. "The Brain"'
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Reg Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. RGS/2025/001"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Class *</label>
                  <select
                    value={classArm}
                    onChange={(e) => setClassArm(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Session *</label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Session</option>
                    {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── 2. Photo Upload ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Student Photo</h2>

              <div className="flex items-center gap-6 flex-wrap">
                {/* Preview */}
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl select-none">🎓</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-dm-sans text-gray-500 text-xs">JPG or PNG · max 3 MB</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-[#f056f0] text-white text-sm font-dm-sans
                                 font-semibold rounded-lg hover:bg-[#8a2a8a] transition-colors duration-300"
                    >
                      <FaUpload className="text-xs" />
                      {photoPreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-400 text-sm
                                   font-dm-sans font-semibold rounded-lg hover:bg-red-50 transition-colors duration-300"
                      >
                        <FaTimes className="text-xs" /> Remove
                      </button>
                    )}
                  </div>
                  {uploading && (
                    <p className="font-dm-sans text-[#f056f0] text-xs">Uploading photo…</p>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
            </div>

            {/* ── 3. Quote & Ambition ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Quote & Ambition</h2>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className={labelClass}>Favourite Quote</label>
                  <textarea
                    rows={3}
                    placeholder="Their most memorable quote or saying…"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className={labelClass}>Ambition / Career Goal</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. To become a doctor…"
                    value={ambition}
                    onChange={(e) => setAmbition(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* ── 4. Awards ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Awards & Achievements</h2>

              {/* Add award input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. Best in Mathematics"
                  value={awardInput}
                  onChange={(e) => setAwardInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAward(); } }}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addAward}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#f056f0] text-white text-sm font-dm-sans
                             font-semibold rounded-lg hover:bg-[#8a2a8a] transition-colors duration-300 whitespace-nowrap"
                >
                  <FaPlus className="text-xs" /> Add
                </button>
              </div>

              {/* Awards list */}
              {awards.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {awards.map((award, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-2 bg-[#f5eaf5] text-[#7a2079] border border-[#f056f0]/20
                                 text-xs font-dm-sans font-semibold px-3 py-1.5 rounded-full"
                    >
                      🏅 {award}
                      <button
                        type="button"
                        onClick={() => removeAward(i)}
                        className="text-[#f056f0] hover:text-red-500 transition-colors ml-1"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {awards.length === 0 && (
                <p className="font-dm-sans text-gray-300 text-sm italic">No awards added yet.</p>
              )}
            </div>

            {/* ── 5. Featured Toggle ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Featured Student</h2>
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <div
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer
                    ${isFeatured ? "bg-[#f056f0]" : "bg-gray-200"}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300
                      ${isFeatured ? "translate-x-5" : "translate-x-0"}`}
                  />
                </div>
                <span className="font-dm-sans text-gray-700 text-sm">
                  Mark as Featured{" "}
                  <span className="text-gray-400 font-normal">(appears at the top of the yearbook)</span>
                </span>
              </label>
            </div>

            {/* ── Feedback ── */}
            {error   && <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm font-medium font-dm-sans">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium font-dm-sans">{success}</div>}

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              <button
                type="button"
                onClick={resetForm}
                className="font-jost font-semibold px-8 py-2.5 rounded-full border border-gray-300 text-gray-600
                           hover:border-[#f056f0] hover:text-[#f056f0] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className={`font-jost font-semibold px-8 py-2.5 rounded-full text-white transition-colors duration-500
                  ${loading || uploading ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}
              >
                {loading ? "Saving..." : uploading ? "Uploading Photo..." : "Add to Yearbook"}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default AddYearbookEntry;