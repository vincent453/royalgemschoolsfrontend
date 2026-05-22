import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccount } from "../../services/sethingsApi";

const Topbar = ({ avatarOverride, onMenuToggle }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchAccount().then((data) => setAdmin(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = admin?.adminName || "Admin";
  const displayEmail = admin?.adminEmail || "";
  const displayRole = admin?.role || "";
  const avatar = avatarOverride || admin?.avatar || "";
  const initials = displayName.split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/portal");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#a13ea1] h-[60px] md:h-[70px] flex items-center px-4 md:px-7 gap-4 shadow-md">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden w-9 h-9 rounded-md bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dots — hidden on mobile */}
      <div className="hidden md:grid grid-cols-3 gap-[3px] mr-1">
        {Array(9).fill(0).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
        ))}
      </div>

      <h1 className="text-white font-bold text-base md:text-xl tracking-tight flex-1">Dashboard</h1>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          title="Settings"
          onClick={() => navigate("/admin/settings")}
          className="w-9 h-9 md:w-[42px] md:h-[42px] rounded-md bg-white/15 hover:bg-white/25 text-white text-sm flex items-center justify-center transition-colors"
        >
          ⚙️
        </button>

        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            title={displayName}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center"
          >
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{initials}</span>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[46px] md:top-[48px] w-52 md:w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-[#fdf8ff]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#A033A0] flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-xs">{initials}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                    {displayRole && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#A033A0] bg-[#A033A0]/10 px-2 py-0.5 rounded-full">
                        {displayRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button onClick={() => { navigate("/admin/settings/"); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-[#fdf8ff] hover:text-[#A033A0]">
                  ⚙️ Settings
                </button>
                <button onClick={() => { navigate("/settings?tab=account"); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-[#fdf8ff] hover:text-[#A033A0]">
                  👤 Edit Profile
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    🚪 Log Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;