const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/lms`
  : "https://royalgemschoolsbackend.vercel.app/api/lms";

// Staff token (teacher / admin)
const h = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Portal token (student / parent)
const ph = () => ({
  Authorization: `Bearer ${localStorage.getItem("portalToken")}`,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── Teacher / Admin — Assignments ────────────────────────────
export const getAssignments = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
  ).toString();
  return fetch(`${BASE}/assignments${qs ? `?${qs}` : ""}`, { headers: h() }).then(handle);
};

export const getAssignment = (id) =>
  fetch(`${BASE}/assignments/${id}`, { headers: h() }).then(handle);

export const createAssignment = (fd) =>
  fetch(`${BASE}/assignments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: fd,
  }).then(handle);

export const updateAssignment = (id, fd) =>
  fetch(`${BASE}/assignments/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: fd,
  }).then(handle);

export const deleteAssignment = (id) =>
  fetch(`${BASE}/assignments/${id}`, { method: "DELETE", headers: h() }).then(handle);

// ── Teacher — Submissions & Grading ──────────────────────────
export const getSubmissions = (assignmentId) =>
  fetch(`${BASE}/assignments/${assignmentId}/submissions`, { headers: h() }).then(handle);

export const gradeSubmission = (submissionId, body) =>
  fetch(`${BASE}/submissions/${submissionId}/grade`, {
    method: "PATCH",
    headers: { ...h(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(handle);

// ── Resources ─────────────────────────────────────────────────
export const getResources = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
  ).toString();
  const token = localStorage.getItem("token") || localStorage.getItem("portalToken");
  return fetch(`${BASE}/resources${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(handle);
};

export const createResource = (fd) =>
  fetch(`${BASE}/resources`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: fd,
  }).then(handle);

export const updateResource = (id, fd) =>
  fetch(`${BASE}/resources/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: fd,
  }).then(handle);

export const deleteResource = (id) =>
  fetch(`${BASE}/resources/${id}`, { method: "DELETE", headers: h() }).then(handle);

// ── Student Portal — My Assignments ──────────────────────────
export const getMyAssignments = () =>
  fetch(`${BASE}/my-assignments`, { headers: ph() }).then(handle);

export const getMyAssignment = (id) =>
  fetch(`${BASE}/my-assignments/${id}`, { headers: ph() }).then(handle);

export const submitAssignment = (assignmentId, fd) =>
  fetch(`${BASE}/assignments/${assignmentId}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("portalToken")}` },
    body: fd,
  }).then(handle);