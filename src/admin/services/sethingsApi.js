
const BASE = import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app/api";

// Helper — always sends the auth token stored at login
async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}                                  // let browser set multipart boundary
        : { "Content-Type": "application/json" }),
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Throw the server's message if available, otherwise a generic one
    throw new Error(data.message ?? `Request failed (${res.status})`);
  }

  return data;
}

// ── School Info ──────────────────────────────

/** GET /settings/school  → { name, tagline, email, phone, address, address2, website, session, logoUrl } */
export const fetchSchoolInfo = () => request("/settings/school");

/** PATCH /settings/school  (JSON fields)  → updated school object */
export const updateSchoolInfo = (fields) =>
  request("/settings/school", { method: "PATCH", body: JSON.stringify(fields) });

/** POST /settings/school/logo  (multipart)  → { logoUrl } */
export const uploadSchoolLogo = (file) => {
  const fd = new FormData();
  fd.append("logo", file);
  return request("/settings/school/logo", { method: "POST", body: fd });
};

// ── Account ──────────────────────────────────

/** GET /settings/account  → { adminName, adminEmail, role } */
export const fetchAccount = () => request("/settings/account");

/** PATCH /settings/account  → updated account object */
export const updateAccount = (fields) =>
  request("/settings/account", { method: "PATCH", body: JSON.stringify(fields) });

// ── Password ─────────────────────────────────

/** POST /settings/password  → { message } */
export const changePassword = ({ currentPassword, newPassword }) =>
  request("/settings/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetch(`${"https://royalgemschoolsbackend.vercel.app/api"}/api/settings/account/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
};