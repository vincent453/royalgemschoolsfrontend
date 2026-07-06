// services/receiptApi.js
const API = "https://royalgemschoolsbackend.vercel.app/api/receipts";

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const portalAuthHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("portalToken")}`,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── Admin ─────────────────────────────────────────────────────
export const getReceipts = async (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") q.set(k, v); });
  const res = await fetch(`${API}?${q}`, { headers: authHeader() });
  return handle(res);
};

export const getReceiptStats = async () => {
  const res = await fetch(`${API}/stats`, { headers: authHeader() });
  return handle(res);
};

export const searchReceipts = async (q) => {
  const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`, { headers: authHeader() });
  return handle(res);
};

export const getReceiptsByStudent = async (studentId) => {
  const res = await fetch(`${API}/student/${studentId}`, { headers: authHeader() });
  return handle(res);
};

export const recordManualPayment = async (body) => {
  const res = await fetch(`${API}/manual`, { method: "POST", headers: authHeader(), body: JSON.stringify(body) });
  return handle(res);
};

export const getReceiptById = async (id) => {
  const token = localStorage.getItem("portalToken") || localStorage.getItem("token");
  const res = await fetch(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return handle(res);
};

export const downloadReceiptPdf = async (id, filename = "receipt.pdf") => {
  const token = localStorage.getItem("portalToken") || localStorage.getItem("token");
  const res = await fetch(`${API}/download/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to download receipt");
  }
  const blob = await res.blob();
  const url  = window.URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// ── Parent / Student portal ──────────────────────────────────
export const getMyReceipts = async () => {
  const res = await fetch(`${API}/me`, { headers: portalAuthHeader() });
  return handle(res);
};