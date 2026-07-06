// services/attendanceApi.js
const BASE_URL = `${import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app"}/api/attendance`;

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token") || localStorage.getItem("portalToken");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch attendance data");
  }
  return data;
};

// ─── CRUD Operations ─────────────────────────────────────
export const createAttendance = (payload) =>
  request("", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const bulkCreateAttendance = (records, term) =>
  request("/bulk", {
    method: "POST",
    body: JSON.stringify({ records, term }),
  });

export const updateAttendance = (id, payload) =>
  request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteAttendance = (id) =>
  request(`/${id}`, { method: "DELETE" });
 
// ─── Query Operations ────────────────────────────────────
export const getAttendance = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return request(`?${params.toString()}`);
};

export const getAttendanceById = (id) => request(`/${id}`);

export const getStudentAttendance = (studentId, filters = {}) => {
  const params = new URLSearchParams(filters);
  return request(`/student/${studentId}?${params.toString()}`);
};

export const getClassAttendance = (classLevel, filters = {}) => {
  const params = new URLSearchParams(filters);
  return request(`/class/${classLevel}?${params.toString()}`);
};

export const getAttendanceByDate = (date, filters = {}) => {
  const params = new URLSearchParams(filters);
  return request(`/date/${date}?${params.toString()}`);
};

export const getMyAttendance = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return request(`/me?${params.toString()}`);
};

// ─── Dashboard & Reports ────────────────────────────────
export const getTodayDashboard = (classLevel = null) => {
  const params = new URLSearchParams();
  if (classLevel) params.append("classLevel", classLevel);
  return request(`/dashboard/today?${params.toString()}`);
};

export const getDashboardStats = (type = "daily", classLevel = null) => {
  const params = new URLSearchParams({ type });
  if (classLevel) params.append("classLevel", classLevel);
  return request(`/dashboard/stats?${params.toString()}`);
};

export const getPendingAttendance = (classLevel, date = null) => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  return request(`/pending/${classLevel}?${params.toString()}`);
};

export const generateAttendanceReport = (reportType = "daily", filters = {}) => {
  const params = new URLSearchParams({ reportType, ...filters });
  return request(`/report/generate?${params.toString()}`);
};
