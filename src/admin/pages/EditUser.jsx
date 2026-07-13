import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft, FaSave, FaUser, FaEnvelope,
  FaLock, FaPhone, FaChalkboardTeacher, FaShieldAlt,
} from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";

const API = import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app";

const ROLES = ["admin", "teacher", "subject_teacher", "class_teacher", "student", "parent"];

const CLASSES = [
  "JSS 1","JSS 2","JSS 3",
  "SSS 1","SSS 2","SSS 3",
  "Kindergarten","Nursery 1","Nursery 2",
];

const roleConfig = {
  admin:           { label: "Admin",           color: "bg-blue-100 text-blue-700"    },
  teacher:         { label: "Teacher",         color: "bg-green-100 text-green-700"  },
  subject_teacher: { label: "Subject Teacher", color: "bg-indigo-100 text-indigo-700"},
  class_teacher:   { label: "Class Teacher",   color: "bg-teal-100 text-teal-700"   },
  student:         { label: "Student",         color: "bg-purple-100 text-purple-700"},
  parent:          { label: "Parent",          color: "bg-orange-100 text-orange-700"},
};

export default function EditUser() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [fetchError,  setFetchError]  = useState("");

  // ── Form fields ──
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [role,            setRole]            = useState("teacher");
  const [phoneNumber,     setPhoneNumber]     = useState("");
  const [subject,         setSubject]         = useState("");
  const [assignedClass,   setAssignedClass]   = useState("");
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [isActive,        setIsActive]        = useState(true);
  const [newPassword,     setNewPassword]     = useState("");
  const [showPassword,    setShowPassword]    = useState(false);

  // ── Fetch user ──
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load user");

        setName(data.name           ?? "");
        setEmail(data.email         ?? "");
        setRole(data.role           ?? "teacher");
        setPhoneNumber(data.phoneNumber ?? "");
        setSubject(data.subject     ?? "");
        setAssignedClass(data.assignedClass ?? "");
        setAssignedClasses(Array.isArray(data.assignedClasses) ? data.assignedClasses : []);
        setIsActive(data.isActive   ?? true);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // ── Toggle class in assignedClasses array ──
  const toggleClass = (cls) => {
    setAssignedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        name:            name.trim(),
        email:           email.trim().toLowerCase(),
        role,
        phoneNumber:     phoneNumber.trim(),
        subject:         subject.trim(),
        assignedClass:   assignedClass.trim(),
        assignedClasses,
        isActive,
      };

      // Only include password if admin typed one
      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          setError("New password must be at least 6 characters.");
          setSaving(false);
          return;
        }
        payload.password = newPassword.trim();
      }

      const res  = await fetch(`${API}/api/users/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setSuccess("User updated successfully!");
      setTimeout(() => navigate("/admin/users"), 1200);
    } catch (err) {
      setError(err.message);
    } finally { 
      setSaving(false);
    }
  };

  // ── Shared styles ──
  const inputClass = `w-full border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-gray-700
                      text-sm placeholder-gray-300 focus:outline-none focus:border-[#f056f0]
                      transition-colors bg-white`;
  const labelClass = `font-dm-sans text-xs text-[#f056f0] font-semibold uppercase tracking-wide mb-1 block`;
  const sectionClass = `bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5`;

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#E6EBEE]">
        <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p => !p)} /></div>
        <div className="flex flex-1 overflow-hidden">
          <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
          <main className="w-full overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
              {[160, 320, 260, 200].map((h, i) => (
                <div key={i} className={`h-[${h}px] bg-white rounded-2xl animate-pulse`} />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Fetch error ──
  if (fetchError) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#E6EBEE]">
        <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p => !p)} /></div>
        <div className="flex flex-1 overflow-hidden">
          <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
          <main className="w-full overflow-y-auto flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center max-w-md">
              <p className="text-red-500 font-dm-sans text-sm mb-4">{fetchError}</p>
              <button onClick={() => navigate("/admin/users")}
                className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-[#f056f0]">
                <FaArrowLeft /> Back to Users
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const showTeacherFields = ["teacher", "subject_teacher", "class_teacher"].includes(role);

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
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 flex flex-col gap-6">

            {/* ── Header ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div>
                <button type="button" onClick={() => navigate("/admin/users")}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f056f0] transition-colors mb-3">
                  <FaArrowLeft /> Back to Users
                </button>
                <h1 className="font-jost font-bold text-gray-800 text-2xl">Edit User</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-1">
                  Update account details and access for this user.
                </p>
              </div>

              {/* Current role badge */}
              <span className={`px-3 py-1.5 rounded-full text-xs font-dm-sans font-semibold
                ${roleConfig[role]?.color ?? "bg-gray-100 text-gray-600"}`}>
                {roleConfig[role]?.label ?? role}
              </span>
            </div>

            {/* ── Basic Info ── */}
            <div className={sectionClass}>
              <h2 className="font-jost font-bold text-gray-800 text-base border-b border-gray-100 pb-3">
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Full name" required className={`${inputClass} pl-9`} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Email address" required className={`${inputClass} pl-9`} />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 08012345678" className={`${inputClass} pl-9`} />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className={labelClass}>Role *</label>
                  <div className="relative">
                    <FaShieldAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                    <select value={role} onChange={e => setRole(e.target.value)}
                      required className={`${inputClass} pl-9 appearance-none`}>
                      {ROLES.map(r => (
                        <option key={r} value={r}>{roleConfig[r]?.label ?? r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-dm-sans text-sm font-semibold text-gray-700">Account Status</p>
                  <p className="font-dm-sans text-xs text-gray-400 mt-0.5">
                    {isActive ? "User can log in and access the system." : "User is blocked from logging in."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(p => !p)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0
                    ${isActive ? "bg-[#f056f0]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300
                    ${isActive ? "left-7" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* ── Teacher Fields ── */}
            {showTeacherFields && (
              <div className={sectionClass}>
                <h2 className="font-jost font-bold text-gray-800 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
                  <FaChalkboardTeacher className="text-[#f056f0]" /> Teaching Assignment
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Subject */}
                  <div>
                    <label className={labelClass}>Subject(s)</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Mathematics, English"
                      className={inputClass} />
                    <p className="font-dm-sans text-xs text-gray-400 mt-1">Comma-separated for multiple subjects</p>
                  </div>

                  {/* Primary class (class teacher) */}
                  <div>
                    <label className={labelClass}>Primary Class</label>
                    <select value={assignedClass} onChange={e => setAssignedClass(e.target.value)}
                      className={`${inputClass} appearance-none`}>
                      <option value="">— None —</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <p className="font-dm-sans text-xs text-gray-400 mt-1">Main class for class teachers</p>
                  </div>
                </div>

                {/* Assigned classes (multi-select) */}
                <div>
                  <label className={labelClass}>Classes Covered</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {CLASSES.map(cls => (
                      <button key={cls} type="button" onClick={() => toggleClass(cls)}
                        className={`px-3 py-1.5 rounded-full text-xs font-dm-sans font-semibold border transition-all duration-200
                          ${assignedClasses.includes(cls)
                            ? "bg-[#f056f0] text-white border-[#f056f0]"
                            : "bg-white text-gray-500 border-gray-200 hover:border-[#f056f0] hover:text-[#f056f0]"
                          }`}>
                        {cls}
                      </button>
                    ))}
                  </div>
                  <p className="font-dm-sans text-xs text-gray-400 mt-2">
                    Toggle classes this teacher covers (for subject teachers)
                  </p>
                </div>
              </div>
            )}

            {/* ── Security ── */}
            <div className={sectionClass}>
              <h2 className="font-jost font-bold text-gray-800 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
                <FaLock className="text-[#f056f0]" /> Security
              </h2>

              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className={`${inputClass} pl-9 pr-20`}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-dm-sans text-xs text-gray-400
                               hover:text-[#f056f0] transition-colors">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="font-dm-sans text-xs text-gray-400 mt-1">
                  Minimum 6 characters. Only fill this if you want to reset the password.
                </p>
              </div>
            </div>

            {/* ── Feedback ── */}
            {error   && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl
                              text-sm font-dm-sans font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl
                              text-sm font-dm-sans font-medium">
                {success}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              <button type="button" onClick={() => navigate("/admin/users")}
                className="font-jost font-semibold px-8 py-2.5 rounded-full border border-gray-300
                           text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0] transition-all duration-300">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full
                            text-white transition-colors duration-300 shadow-sm
                            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#f056f0] hover:bg-[#525fe1]"}`}>
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><FaSave /> Save Changes</>
                }
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}