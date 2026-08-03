import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getScholarship, createScholarship, updateScholarship } from "../../services/scholarshipApi";

const TYPES = [
  "Academic","Sports","Government","Private","NGO",
  "Religious","Staff Ward","Merit","Need Based","Full","Partial",
];
const CLASSES = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3","Kindergarten","Nursery 1","Nursery 2"];
const STATUSES = ["Active","Inactive"];

const inputClass = `w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                    placeholder-gray-300 focus:outline-none focus:border-[#f056f0] transition-colors bg-white`;
const labelClass = `font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block`;
const section    = `bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5`;

export default function ScholarshipForm() {
  const { id }     = useParams();
  const isEdit     = !!id;
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading,     setLoading]     = useState(isEdit);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  const [form, setForm] = useState({
    scholarshipName: "", scholarshipCode: "", description: "", sponsor: "", type: "Academic",
    discountType: "percentage", discountValue: "",
    applicableClasses: [], applicableSession: "",
    maxBeneficiaries: "", startDate: "", endDate: "",
    eligibilityRequirements: "", notes: "", status: "Active",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isEdit || hasFetched.current) return;
    hasFetched.current = true;
    getScholarship(id)
      .then(data => {
        const s = data.scholarship;
        const toDateInput = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";
        setForm({
          scholarshipName:         s.scholarshipName         ?? "",
          scholarshipCode:         s.scholarshipCode         ?? "",
          description:             s.description             ?? "",
          sponsor:                 s.sponsor                 ?? "",
          type:                    s.type                    ?? "Academic",
          discountType:            s.discountType            ?? "percentage",
          discountValue:           s.discountValue           ?? "",
          applicableClasses:       s.applicableClasses       ?? [],
          applicableSession:       s.applicableSession       ?? "",
          maxBeneficiaries:        s.maxBeneficiaries        ?? "",
          startDate:               toDateInput(s.startDate),
          endDate:                 toDateInput(s.endDate),
          eligibilityRequirements: s.eligibilityRequirements ?? "",
          notes:                   s.notes                   ?? "",
          status:                  s.status                  ?? "Active",
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const toggleClass = (cls) => {
    set("applicableClasses", form.applicableClasses.includes(cls)
      ? form.applicableClasses.filter(c => c !== cls)
      : [...form.applicableClasses, cls]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const body = {
        ...form,
        discountValue:   Number(form.discountValue),
        maxBeneficiaries: form.maxBeneficiaries ? Number(form.maxBeneficiaries) : null,
      };
      if (isEdit) {
        await updateScholarship(id, body);
        setSuccess("Scholarship updated successfully!");
      } else {
        await createScholarship(body);
        setSuccess("Scholarship created successfully!");
        setTimeout(() => navigate("/admin/scholarships"), 1200);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#E6EBEE]">
        <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p => !p)} /></div>
        <div className="flex flex-1 overflow-hidden">
          <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
          <main className="w-full overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              {[160,280,220,180].map((h,i) => <div key={i} style={{height:h}} className="bg-white rounded-2xl animate-pulse" />)}
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <button type="button" onClick={() => navigate("/admin/scholarships")}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f056f0] mb-3 transition-colors">
                  <FaArrowLeft /> Back to Scholarships
                </button>
                <h1 className="font-jost font-bold text-2xl text-gray-800">
                  {isEdit ? "Edit Scholarship" : "New Scholarship"}
                </h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-1">
                  {isEdit ? "Update scholarship details." : "Create a new scholarship program."}
                </p>
              </div>
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 font-jost font-semibold px-6 py-2.5 rounded-full
                            text-white shadow-sm transition-colors
                            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><FaSave /> {isEdit ? "Save Changes" : "Create"}</>}
              </button>
            </div>

            {/* Basic Info */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Scholarship Name *</label>
                  <input type="text" value={form.scholarshipName} onChange={e => set("scholarshipName", e.target.value)}
                    placeholder="e.g. Academic Excellence Award" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Scholarship Code *</label>
                  <input type="text" value={form.scholarshipCode} onChange={e => set("scholarshipCode", e.target.value.toUpperCase())}
                    placeholder="e.g. ACAD-2025" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Type *</label>
                  <select value={form.type} onChange={e => set("type", e.target.value)}
                    required className={`${inputClass} appearance-none`}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sponsor</label>
                  <input type="text" value={form.sponsor} onChange={e => set("sponsor", e.target.value)}
                    placeholder="e.g. Royal Gem Foundation" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={e => set("status", e.target.value)}
                    className={`${inputClass} appearance-none`}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Applicable Session</label>
                  <input type="text" value={form.applicableSession} onChange={e => set("applicableSession", e.target.value)}
                    placeholder="e.g. 2024/2025" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
                    placeholder="Describe the scholarship..." className={`${inputClass} resize-none`} />
                </div>
              </div>
            </div>

            {/* Discount */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Discount Configuration</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Discount Type *</label>
                  <select value={form.discountType} onChange={e => set("discountType", e.target.value)}
                    required className={`${inputClass} appearance-none`}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Discount Value * {form.discountType === "percentage" ? "(0–100%)" : "(₦ amount)"}
                  </label>
                  <input type="number" min={0} max={form.discountType === "percentage" ? 100 : undefined}
                    step={form.discountType === "percentage" ? 1 : 0.01}
                    value={form.discountValue} onChange={e => set("discountValue", e.target.value)}
                    placeholder={form.discountType === "percentage" ? "e.g. 50" : "e.g. 25000"}
                    required className={inputClass} />
                </div>
              </div>
              {form.discountValue && (
                <div className="bg-[#f056f0]/5 border border-[#f056f0]/20 rounded-xl px-4 py-3">
                  <p className="font-dm-sans text-sm text-[#f056f0] font-semibold">
                    {form.discountType === "percentage"
                      ? `${form.discountValue}% off the student's school fees`
                      : `₦${Number(form.discountValue).toLocaleString("en-NG")} deducted from school fees`}
                  </p>
                </div>
              )}
            </div>

            {/* Eligibility & Classes */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Eligibility</h2>
              <div>
                <label className={labelClass}>Applicable Classes</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CLASSES.map(cls => (
                    <button key={cls} type="button" onClick={() => toggleClass(cls)}
                      className={`px-3 py-1.5 rounded-full text-xs font-dm-sans font-semibold border transition-all
                        ${form.applicableClasses.includes(cls)
                          ? "bg-[#f056f0] text-white border-[#f056f0]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-[#f056f0] hover:text-[#f056f0]"}`}>
                      {cls}
                    </button>
                  ))}
                  <button type="button" onClick={() => set("applicableClasses", form.applicableClasses.length === CLASSES.length ? [] : CLASSES)}
                    className="px-3 py-1.5 rounded-full text-xs font-dm-sans font-semibold border border-gray-200
                               text-gray-400 hover:border-[#f056f0] hover:text-[#f056f0] transition-all">
                    {form.applicableClasses.length === CLASSES.length ? "Clear All" : "Select All"}
                  </button>
                </div>
                <p className="font-dm-sans text-xs text-gray-400 mt-2">
                  Leave empty to apply to all classes.
                </p>
              </div>
              <div>
                <label className={labelClass}>Eligibility Requirements</label>
                <textarea rows={3} value={form.eligibilityRequirements}
                  onChange={e => set("eligibilityRequirements", e.target.value)}
                  placeholder="e.g. Minimum average of 80%, Good conduct..."
                  className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Maximum Beneficiaries</label>
                <input type="number" min={1} value={form.maxBeneficiaries}
                  onChange={e => set("maxBeneficiaries", e.target.value)}
                  placeholder="Leave blank for unlimited" className={inputClass} />
              </div>
            </div>

            {/* Duration */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Duration</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
                    required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)}
                    required className={inputClass} />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className={section}>
              <h2 className="font-jost font-bold text-gray-800 border-b border-gray-100 pb-3">Additional Notes</h2>
              <textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)}
                placeholder="Any additional notes..." className={`${inputClass} resize-none`} />
            </div>

            {error   && <div className="bg-red-50 border border-red-200 text-red-500 px-5 py-3 rounded-xl font-dm-sans text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-600 px-5 py-3 rounded-xl font-dm-sans text-sm">{success}</div>}

            <div className="flex justify-end gap-4 pb-8">
              <button type="button" onClick={() => navigate("/admin/scholarships")}
                className="px-8 py-2.5 rounded-full border border-gray-300 font-jost font-semibold text-gray-600
                           hover:border-[#f056f0] hover:text-[#f056f0] transition-all">Cancel</button>
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-jost font-semibold text-white
                            transition-colors ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><FaSave /> {isEdit ? "Save Changes" : "Create Scholarship"}</>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}