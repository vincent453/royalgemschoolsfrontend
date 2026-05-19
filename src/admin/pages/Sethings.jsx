import { useState, useEffect, useCallback } from "react";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import {
  FaLock, FaUserShield, FaBell, FaPalette,
  FaSchool, FaEye, FaEyeSlash, FaCamera, FaUser,
  FaSpinner, FaExclamationCircle,
} from "react-icons/fa";
import {
  fetchSchoolInfo,
  updateSchoolInfo,
  uploadSchoolLogo,
  fetchAccount,
  updateAccount,
  changePassword,
} from "../services/settingsApi";   // ← adjust path if needed

// ─────────────────────────────────────────────────────────────
// Utility hooks
// ─────────────────────────────────────────────────────────────

/** Runs an async fn; manages loading + error state for you */
function useAsync() {
  const [state, setState] = useState({ loading: false, error: null });

  const run = useCallback(async (fn) => {
    setState({ loading: true, error: null });
    try {
      const result = await fn();
      setState({ loading: false, error: null });
      return result;
    } catch (err) {
      setState({ loading: false, error: err.message ?? "Something went wrong" });
      throw err;          // let the caller handle it too if needed
    }
  }, []);

  return { ...state, run };
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const inputClass = `w-full border border-gray-200 rounded-lg px-4 py-2.5
  font-dm-sans text-gray-700 text-sm placeholder-gray-300
  focus:outline-none focus:border-[#A033A0] bg-white
  transition-colors duration-300`;

const labelClass = `font-dm-sans text-[#A033A0] text-sm font-semibold mb-1 block`;

const SaveButton = ({ loading, label = "Save Changes" }) => (
  <div className="flex justify-end pt-2 border-t border-gray-100">
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5
                 rounded-full bg-[#A033A0] hover:bg-[#525fe1] text-white
                 transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading && <FaSpinner className="animate-spin text-sm" />}
      {loading ? "Saving…" : label}
    </button>
  </div>
);

const ErrorBanner = ({ message }) =>
  message ? (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200
                    text-red-600 font-dm-sans text-sm px-5 py-3 rounded-xl">
      <FaExclamationCircle className="shrink-0" /> {message}
    </div>
  ) : null;

const SuccessBanner = ({ message }) =>
  message ? (
    <div className="bg-green-50 border border-green-200 text-green-700
                    font-dm-sans text-sm px-5 py-3 rounded-xl">
      ✓ {message}
    </div>
  ) : null;

/** Inline skeleton shimmer for loading states */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─────────────────────────────────────────────────────────────
// SchoolInfoTab
// ─────────────────────────────────────────────────────────────
const SchoolInfoTab = () => {
  const fetchAsync  = useAsync();
  const saveAsync   = useAsync();
  const logoAsync   = useAsync();

  const [school, setSchool]   = useState(null);   // null = not yet loaded
  const [preview, setPreview] = useState(null);
  const [toast, setToast]     = useState("");

  // Load on mount
  useEffect(() => {
    fetchAsync.run(async () => {
      const data = await fetchSchoolInfo();
      setSchool(data);
      if (data.logo) setPreview(data.logo); // model field is "logo" not "logoUrl"
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Logo upload — fires immediately on file pick
  const handleLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Optimistic local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const { logoUrl } = await logoAsync.run(() => uploadSchoolLogo(file));
      setSchool((prev) => ({ ...prev, logo: logoUrl })); // store under "logo"
      setPreview(logoUrl);
      showToast("Logo updated!");
    } catch {
      setPreview(school?.logo ?? null); // rollback uses "logo"
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await saveAsync.run(() => updateSchoolInfo(school));
      setSchool(updated);
      showToast("School info saved successfully!");
    } catch { /* error already in saveAsync.error */ }
  };

  // ── Loading skeleton ──
  if (fetchAsync.loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center gap-5">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={i < 2 ? "sm:col-span-2" : ""}>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
      <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
        School Information
      </h2>

      <SuccessBanner message={toast} />
      <ErrorBanner   message={fetchAsync.error ?? saveAsync.error} />

      {/* Logo */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full bg-gray-100
                        border-2 border-[#A033A0]/20 overflow-hidden shrink-0">
          {preview
            ? <img src={preview} alt="School logo" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <FaSchool className="text-gray-300 text-3xl" />
              </div>}
          {/* Upload overlay */}
          <label htmlFor="logo"
            className="absolute inset-0 bg-black/40 flex items-center justify-center
                       opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            {logoAsync.loading
              ? <FaSpinner className="text-white animate-spin" />
              : <FaCamera className="text-white" />}
          </label>
        </div>
        <input id="logo" type="file" accept="image/*" onChange={handleLogo} className="hidden" />
        <div>
          <label htmlFor="logo"
            className="font-dm-sans text-xs font-semibold px-4 py-2 rounded-full
                       bg-[#A033A0] text-white cursor-pointer hover:bg-[#525fe1]
                       transition-colors duration-300">
            {logoAsync.loading ? "Uploading…" : "Upload Logo"}
          </label>
          {logoAsync.error && (
            <p className="font-dm-sans text-xs text-red-500 mt-1">{logoAsync.error}</p>
          )}
          <p className="font-dm-sans text-xs text-gray-400 mt-2">PNG, JPG up to 2 MB</p>
        </div>
      </div>

      {school && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "schoolName", label: "School Name",      span: 2 },
            { key: "tagline",    label: "Tagline / Motto",  span: 2 },
            { key: "email",      label: "Email",            type: "email" },
            { key: "phone",      label: "Phone" },
            { key: "address",    label: "Address (Lagos)" },
            { key: "address2",   label: "Address (Abuja)" },
            { key: "website",    label: "Website" },
            { key: "session",    label: "Current Session",  placeholder: "e.g. 2024/2025" },
          ].map(({ key, label, span, type = "text", placeholder }) => (
            <div key={key} className={span === 2 ? "sm:col-span-2" : ""}>
              <label className={labelClass}>{label}</label>
              <input
                type={type}
                value={school[key] ?? ""}
                placeholder={placeholder}
                onChange={(e) => setSchool({ ...school, [key]: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      )}

      <SaveButton loading={saveAsync.loading} />
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// AccountTab
// ─────────────────────────────────────────────────────────────
const AccountTab = () => {
  const fetchAsync = useAsync();
  const saveAsync  = useAsync();

  const [account, setAccount] = useState(null);
  const [toast, setToast]     = useState("");

  useEffect(() => {
    fetchAsync.run(async () => {
      const data = await fetchAccount();
      setAccount(data);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await saveAsync.run(() =>
        updateAccount({ adminName: account.adminName, adminEmail: account.adminEmail })
      );
      setAccount(updated);
      showToast("Account details saved!");
    } catch { /* error in saveAsync.error */ }
  };

  if (fetchAsync.loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
        <Skeleton className="h-6 w-40" />
        <div className="flex items-center gap-5">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex flex-col gap-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={i === 2 ? "sm:col-span-2" : ""}>
              <Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
      <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
        Account Details
      </h2>

      <SuccessBanner message={toast} />
      <ErrorBanner   message={fetchAsync.error ?? saveAsync.error} />

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full bg-[#A033A0]/10
                        border-2 border-[#A033A0]/20 overflow-hidden shrink-0
                        flex items-center justify-center">
          <FaUser className="text-[#A033A0] text-3xl" />
        </div>
        {account && (
          <div>
            <p className="font-jost font-bold text-gray-800">{account.adminName}</p>
            <p className="font-dm-sans text-gray-400 text-sm">{account.role}</p>
          </div>
        )}
      </div>

      {account && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Admin Name</label>
            <input value={account.adminName}
              onChange={(e) => setAccount({ ...account, adminName: e.target.value })}
              className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Admin Email</label>
            <input type="email" value={account.adminEmail}
              onChange={(e) => setAccount({ ...account, adminEmail: e.target.value })}
              className={inputClass} required />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Role</label>
            <input value={account.role} disabled
              className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            <p className="font-dm-sans text-xs text-gray-400 mt-1">
              Role can only be changed by the system owner.
            </p>
          </div>
        </div>
      )}

      <SaveButton loading={saveAsync.loading} />
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// PasswordTab
// ─────────────────────────────────────────────────────────────
const PasswordTab = () => {
  const pwAsync = useAsync();
  const [toast, setToast] = useState("");

  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: "",
  });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });

  const toggle = (field) => setShow((p) => ({ ...p, [field]: !p[field] }));
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // Inline validation
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!passwords.current)          e.current  = "Current password is required";
    if (!passwords.newPass)          e.newPass  = "New password is required";
    else if (passwords.newPass.length < 8)
                                     e.newPass  = "Must be at least 8 characters";
    if (passwords.newPass !== passwords.confirm)
                                     e.confirm  = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    try {
      await pwAsync.run(() =>
        changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass })
      );
      setPasswords({ current: "", newPass: "", confirm: "" });
      showToast("Password updated successfully!");
    } catch { /* error in pwAsync.error */ }
  };

  // Strength score 0–4
  const strength = (() => {
    const p = passwords.newPass;
    let s = 0;
    if (p.length >= 8)             s++;
    if (/[A-Z]/.test(p))           s++;
    if (/[0-9]/.test(p))           s++;
    if (/[^A-Za-z0-9]/.test(p))   s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][strength];

  const PasswordField = ({ field, label }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
        <input
          type={show[field] ? "text" : "password"}
          value={passwords[field]}
          onChange={(e) => {
            setPasswords({ ...passwords, [field]: e.target.value });
            if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: "" });
          }}
          placeholder="••••••••"
          className={`${inputClass} pl-10 pr-10
            ${fieldErrors[field] ? "border-red-400 focus:border-red-400" : ""}`}
        />
        <button type="button" onClick={() => toggle(field)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                     hover:text-[#A033A0] transition-colors duration-300">
          {show[field] ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {fieldErrors[field] && (
        <p className="font-dm-sans text-xs text-red-400 mt-1">{fieldErrors[field]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
      <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
        Change Password
      </h2>

      <SuccessBanner message={toast} />
      <ErrorBanner   message={pwAsync.error} />

      {/* Requirements hint */}
      <div className="bg-[#f0f1ff] rounded-xl p-4 flex flex-col gap-1">
        <p className="font-dm-sans text-sm font-semibold text-[#525fe1]">Password requirements</p>
        {[
          "At least 8 characters long",
          "Mix of uppercase and lowercase letters",
          "At least one number",
          "At least one special character (!@#$…)",
        ].map((tip) => (
          <p key={tip} className="font-dm-sans text-xs text-gray-500">• {tip}</p>
        ))}
      </div>

      <div className="flex flex-col gap-4 max-w-md">
        <PasswordField field="current" label="Current Password" />
        <PasswordField field="newPass" label="New Password" />

        {/* Strength bar — only shown when typing new password */}
        {passwords.newPass && (
          <div className="flex flex-col gap-1 -mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300
                              ${n <= strength ? strengthColor : "bg-gray-200"}`}
                />
              ))}
            </div>
            <p className="font-dm-sans text-xs text-gray-400">
              Strength: <span className="font-semibold text-gray-600">{strengthLabel}</span>
            </p>
          </div>
        )}

        <PasswordField field="confirm" label="Confirm New Password" />
      </div>

      <SaveButton loading={pwAsync.loading} label="Update Password" />
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// Settings (root page)
// ─────────────────────────────────────────────────────────────

const tabs = [
  { id: "school",   label: "School Info",     icon: <FaSchool />    },
  { id: "account",  label: "Account",         icon: <FaUserShield /> },
  { id: "password", label: "Change Password", icon: <FaLock />      },
  { id: "notif",    label: "Notifications",   icon: <FaBell />      },
  { id: "appearance",label:"Appearance",      icon: <FaPalette />   },
]

const Settings = () => {
  const [activeTab, setActiveTab] = useState("school");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      window.location.href = "/admin/portal";
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar /></div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar /></div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">

            <div>
              <h1 className="font-jost font-bold text-gray-800 text-2xl">Settings</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-0.5">
                Manage your school system preferences
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

              {/* ── Tab sidebar ── */}
              <div className="w-full lg:w-56 shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col gap-1">
                  {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                                  font-dm-sans font-semibold text-left transition-all duration-300
                                  ${activeTab === tab.id
                                    ? "bg-[#A033A0] text-white shadow-sm"
                                    : "text-gray-500 hover:bg-[#A033A0]/10 hover:text-[#A033A0]"}`}>
                      <span className="text-base">{tab.icon}</span>
                      {tab.label}
                      {/* Coming-soon badge for unimplemented tabs */}
                      {(tab.id === "notif" || tab.id === "appearance") && (
                        <span className="ml-auto text-[10px] font-dm-sans bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                          Soon
                        </span>
                      )}
                    </button>
                  ))}
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                               font-dm-sans font-semibold text-left text-gray-500
                               hover:bg-red-50 hover:text-red-500 transition-all duration-300">
                    <span className="text-base"><FaUser /></span>
                    Log Out
                  </button>
                </div>
              </div>

              {/* ── Tab content ── */}
              <div className="flex-1">
                {activeTab === "school"    && <SchoolInfoTab />}
                {activeTab === "account"   && <AccountTab />}
                {activeTab === "password"  && <PasswordTab />}

                {/* Placeholder for upcoming tabs */}
                {(activeTab === "notif" || activeTab === "appearance") && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12
                                  flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#A033A0]/10 flex items-center justify-center text-[#A033A0] text-2xl">
                      {tabs.find(t => t.id === activeTab)?.icon}
                    </div>
                    <p className="font-jost font-bold text-gray-700 text-lg">Coming Soon</p>
                    <p className="font-dm-sans text-sm text-gray-400 max-w-xs">
                      This section is under development and will be available in the next update.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;