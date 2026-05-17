import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dark from "../../../assets/dark.svg";
import { fetchAccount } from "../../services/sethingsApi"; // adjust path if needed

const Topbar = () => {
  const navigate = useNavigate();
  const [admin, setAdmin]         = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const menuRef                   = useRef(null);

  // ── Fetch real admin profile on mount ─────────────────────
  useEffect(() => {
    fetchAccount()
      .then(setAdmin)
      .catch(() => {
        // token missing / expired — silently degrade, avatar shows initials fallback
      });
  }, []);

  // ── Close menu when clicking outside ──────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Derived display values ─────────────────────────────────
  const displayName   = admin?.adminName  ?? "Admin";
  const displayEmail  = admin?.adminEmail ?? "";
  const displayRole   = admin?.role       ?? "";

  // Initials fallback (e.g. "Super Admin" → "SA")
  const initials = displayName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/portal");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#a13ea1] h-[70px] flex items-center px-7 gap-4 shadow-md">

      {/* Dots icon */}
      <div className="grid grid-cols-3 gap-[3px] mr-1">
        {Array(9).fill(0).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
        ))}
      </div>

      <h1 className="text-white font-bold text-xl tracking-tight flex-1">Dashboard</h1>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {[
          { icon: "🔍", label: "Search"        },
          { icon: "⊞",  label: "Grid"          },
          { icon: <img src={dark} alt="Theme" />, label: "Theme" },
          { icon: "⤢",  label: "Expand"        },
          { icon: "💬",  label: "Chat"          },
          { icon: "🔔",  label: "Notifications" },
          { icon: "⚙️",  label: "Settings",     onClick: () => navigate("/settings") },
        ].map(({ icon, label, onClick }) => (
          <button
            key={label}
            title={label}
            onClick={onClick}
            className="w-[42px] h-[42px] rounded-md bg-white/15 hover:bg-white/25
                       text-white text-sm flex items-center justify-center
                       transition-colors border border-transparent"
          >
            {icon}
          </button>
        ))}

        {/* ── Avatar + dropdown ── */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="w-10 h-10 rounded-md overflow-hidden flex items-center
                       justify-center cursor-pointer focus:outline-none
                       focus:ring-2 focus:ring-white/50"
            title={displayName}
          >
            {/* Shows initials — no hardcoded image */}
            <div className="w-full h-full bg-white/20 flex items-center justify-center
                            font-bold text-white text-sm tracking-wide">
              {initials}
            </div>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[48px] w-56 bg-white rounded-xl
                            shadow-xl border border-gray-100 z-50 overflow-hidden">

              {/* Profile info */}
              <div className="px-4 py-3 border-b border-gray-100 bg-[#fdf8ff]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#A033A0] flex items-center
                                  justify-center text-white font-bold text-xs flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-jost font-bold text-gray-800 text-sm truncate">
                      {displayName}
                    </p>
                    <p className="font-dm-sans text-xs text-gray-400 truncate">
                      {displayEmail}
                    </p>
                    {displayRole && (
                      <span className="inline-block mt-0.5 text-[10px] font-dm-sans
                                       font-semibold text-[#A033A0] bg-[#A033A0]/10
                                       px-2 py-0.5 rounded-full">
                        {displayRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { navigate("/settings"); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm
                             font-dm-sans text-gray-600 hover:bg-[#fdf8ff]
                             hover:text-[#A033A0] transition-colors"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={() => { navigate("/settings?tab=account"); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm
                             font-dm-sans text-gray-600 hover:bg-[#fdf8ff]
                             hover:text-[#A033A0] transition-colors"
                >
                  👤 Edit Profile
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm
                               font-dm-sans text-red-500 hover:bg-red-50 transition-colors"
                  >
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