import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo.png"
import checkresultimg from "../../assets/img/checkresultimg.jpg"
import family from "../../assets/img/family.png"
import student from "../../assets/img/graduate.png"
import { EyeClosed, EyeIcon } from "lucide-react";

const PORTALS = {
  student: {
    label:       "Student",
    emoji:       <img src={student} className="w-5" />,
    idLabel:     "Registration Number",
    idPlaceholder: "e.g. RGS/2024/001",
    idHint:      "Givien to you by the school",
    pinHint:     "Given to you during enrollment",
    welcome:     "Access your results, timetable, attendance record and fee statements — all in one place.",
    apiPath:     "/api/student/login",
    redirectTo:  "/student/dashboard",
    tabColor:    "border-[#A033A0] bg-[#f5eaf5] text-[#A033A0]",
    tabInactive: "border-gray-200 bg-white text-gray-400",
    accent:      "#A033A0",
    badgeText:   "Student Portal",
    badgeBg:     "bg-[#f5eaf5] text-[#7a2079]",
  },
  parent: {
    label:       "Parent / Guardian",
    emoji:       <img src={family} className="w-5" />,
    idLabel:     "Parent Access ID",
    idPlaceholder: "e.g. PAR/2024/001",
    idHint:      "Use your child registration number",
    pinHint:     "Use your childs pin",
    welcome:     "Monitor your child's academic progress, results, attendance and fee payments from anywhere.",
    apiPath:     "/api/parent/login",
    redirectTo:  "/parent/dashboard",
    tabColor:    "border-[#A033A0] bg-[#f5eaf5] text-[#A033A0]",
    tabInactive: "border-gray-200 bg-white text-gray-400",
    accent:      "#A033A0",
    badgeText:   "Parent Portal",
    badgeBg:     "bg-[#f5eaf5] text-[#7a2079]",
  },
};

const STATS = [
  { label: "Students Enrolled", value: "1,200+" },
  { label: "Academic Sessions",  value: "10+"    },
  { label: "Awards Won",         value: "48"     },
];

const INFO = [
  { icon: "📍", text: "Plot 45, Royal Gem Avenue, Abuja" },
  { icon: "📞", text: "+234 800 123 4567"               },
  { icon: "✉️", text: "info@royalgem.edu.ng"            },
  { icon: "🌐", text: "www.royalgem.edu.ng"             },
];

export default function Portal() {
  const navigate = useNavigate();

  const [tab, setTab]         = useState("student");
  const [id, setId]           = useState("");
  const [pin, setPin]         = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [shake, setShake]     = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const portal = PORTALS[tab];

  const switchTab = (t) => {
    setTab(t);
    setId(""); setPin(""); setError(""); setShowPin(false);
  };

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!id.trim() || !pin.trim()) { triggerError("Please fill in all fields."); return; }
    if (pin.length < 4)            { triggerError("PIN must be at least 4 digits."); return; }

    setLoading(true);
    try {
      const res  = await fetch(portal.apiPath, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: id.trim(), pin }),
      });
      const data = await res.json();
      if (!res.ok) { triggerError(data.message ?? "Invalid credentials."); return; }
      navigate(portal.redirectTo);
    } catch {
      triggerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStudent = tab === "student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4a7c4] via-[#fff7ff] to-[#e8cfe8] flex items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Decorative blobs */}
      <div className="absolute -top-16 -left-20 w-56 h-56 rounded-full bg-[#A033A0]/10 animate-pulse pointer-events-none" />
      <div className="absolute top-1/3 -right-12 w-36 h-36 rounded-full bg-[#1a6fb5]/10 animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-[#A033A0]/08 animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Main wrapper */}
      <div className={`relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-stretch transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>

        {/* ── LEFT PANEL ── */}
        <div className={`flex-1 flex flex-col gap-5 p-9 rounded-3xl text-white shadow-2xl transition-all duration-500 ${isStudent ? "" : "bg-gradient-to-br from-[#1a6fb5] to-[#0c447c]"}`} style={{backgroundImage: `url(${checkresultimg})`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat:'norepeat'}}>

          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl shrink-0">
              <img src={logo} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Royal Gem Schools</h1>
              <p className="text-xs text-white/60 italic mt-0.5">Nurturing to Flourish</p>
            </div>
          </div>

          <div className="border-t border-white/20" />

          {/* Welcome text */}
          <p className="text-sm text-white/85 leading-relaxed">{portal.welcome}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-white/12 border border-white/18 rounded-2xl p-3 flex flex-col items-center gap-1">
                <span className="text-lg font-bold">{stat.value}</span>
                <span className="text-[10px] text-white/65 text-center leading-tight">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/20" />

          {/* Contact info */}
          <div className="flex flex-col gap-2.5">
            {INFO.map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-sm shrink-0">{item.icon}</span>
                <span className="text-xs text-white/80 leading-snug">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Session badge */}
          <div className="mt-auto flex items-center gap-2 bg-white/12 border border-white/20 rounded-full px-4 py-2 self-start">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] shrink-0" />
            <span className="text-[11px] text-white/85 whitespace-nowrap">2024/2025 Session · 2nd Term</span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Tab switcher */}
          <div className="flex gap-3">
            {Object.entries(PORTALS).map(([key, p]) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-300 cursor-pointer
                    ${active ? p.tabColor : p.tabInactive}`}
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form card */}
          <div className={`bg-white rounded-3xl p-8 shadow-xl border border-[#A033A0]/10 flex flex-col gap-6 transition-all duration-300 ${shake ? "animate-[shake_0.5s_ease]" : ""}`}
            style={{ borderTop: `3px solid ${portal.accent}` }}>

            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: isStudent ? "#f5eaf5" : "#e6f1fb", border: `1.5px solid ${portal.accent}33` }}>
                {portal.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">{portal.label} Login</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {isStudent ? "Access your academic portal" : "Access your child's portal"}
                </p>
              </div>
              <span className={`ml-auto text-[11px] font-semibold px-3 py-1 rounded-full ${portal.badgeBg}`}>
                {portal.badgeText}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* ID field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: portal.accent }}>
                  {portal.idLabel}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-base pointer-events-none">🪪</span>
                  <input
                    type="text"
                    value={id}
                    onChange={e => setId(e.target.value.toUpperCase())}
                    placeholder={portal.idPlaceholder}
                    autoComplete="username"
                    spellCheck={false}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border-[1.5px] border-gray-200 bg-[#fdf8fd] text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all duration-200"
                    style={{ "--tw-ring-color": portal.accent }}
                    onFocus={e => { e.target.style.borderColor = portal.accent; e.target.style.boxShadow = `0 0 0 3px ${portal.accent}20`; }}
                    onBlur={e =>  { e.target.style.borderColor = "#e5e7eb";     e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <span className="text-xs text-gray-400">{portal.idHint}</span>
              </div>

              {/* PIN field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: portal.accent }}>PIN</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-base pointer-events-none">🔐</span>
                  <input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g,"").slice(0,6))}
                    placeholder="••••••"
                    inputMode="numeric"
                    autoComplete="current-password"
                    className="w-full h-12 pl-10 pr-12 rounded-xl border-[1.5px] border-gray-200 bg-[#fdf8fd] text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all duration-200"
                    style={{ letterSpacing: showPin ? "normal" : "6px" }}
                    onFocus={e => { e.target.style.borderColor = portal.accent; e.target.style.boxShadow = `0 0 0 3px ${portal.accent}20`; }}
                    onBlur={e =>  { e.target.style.borderColor = "#e5e7eb";     e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(p => !p)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors text-base cursor-pointer bg-transparent border-none"
                  >
                    {showPin ? <EyeIcon /> : <EyeClosed/>}
                  </button>
                </div>
                <span className="text-xs text-gray-400">{portal.pinHint}</span>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border-none"
                style={{ background: `linear-gradient(135deg, ${portal.accent}, ${isStudent ? "#6d1b6d" : "#0c447c"})` }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  `Access ${portal.label} Portal →`
                )}
              </button>

            </form>

            {/* Footer links */}
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-center">
              <p className="text-xs text-gray-400">
                Forgot your PIN? Contact the school office or your class teacher.
              </p>
              <p className="text-xs text-gray-400">
                Are you an admin or teacher?{" "}
                <a href="/admin/portal" className="font-semibold hover:underline" style={{ color: portal.accent }}>
                  Staff Login →
                </a>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex gap-2 flex-wrap justify-center">
            {["🔒 Secure Login", "📋 WAEC Verified", "🏅 Award-Winning School"].map(t => (
              <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#A033A0]/20 bg-[#f5eaf5] text-[#7a2079]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%     { transform:translateX(-8px); }
          40%     { transform:translateX(8px); }
          60%     { transform:translateX(-5px); }
          80%     { transform:translateX(5px); }
        }
      `}</style>
    </div>
  );
}