import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccount } from "../../services/sethingsApi";

const Topbar = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Fetch admin
  useEffect(() => {
    fetchAccount()
      .then(setAdmin)
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = admin?.adminName ?? "Admin";
  const displayEmail = admin?.adminEmail ?? "";
  const displayRole = admin?.role ?? "";

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

      {/* dots */}
      <div className="grid grid-cols-3 gap-[3px] mr-1">
        {Array(9).fill(0).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
        ))}
      </div>

      <h1 className="text-white font-bold text-xl tracking-tight flex-1">
        Dashboard
      </h1>

      {/* buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("settings")}
          className="w-[42px] h-[42px] rounded-md bg-white/15 hover:bg-white/25
                     text-white text-sm flex items-center justify-center"
        >
          ⚙️
        </button>

        {/* avatar dropdown */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center"
            title={displayName}
          >
            {admin?.avatar ? (
              <img
                src={admin.avatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center
                              font-bold text-white text-sm">
                {initials}
              </div>
            )}
          </button>

          {/* dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[48px] w-56 bg-white rounded-xl shadow-xl border z-50">

              {/* profile header */}
              <div className="px-4 py-3 border-b bg-[#fdf8ff]">
                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[#A033A0] flex items-center justify-center text-white font-bold text-xs">

                    {admin?.avatar ? (
                      <img
                        src={admin.avatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}

                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {displayEmail}
                    </p>

                    {displayRole && (
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#A033A0]/10 text-[#A033A0]">
                        {displayRole}
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* menu */}
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  ⚙️ Settings
                </button>

                <button
                  onClick={() => {
                    navigate("/settings?tab=account");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  👤 Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 text-sm border-t"
                >
                  🚪 Log Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Topbar;