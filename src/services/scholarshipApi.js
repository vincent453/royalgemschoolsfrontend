const BASE_URL = `${import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app"}/api/scholarships`;

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
    throw new Error(data.message || "Scholarship request failed.");
  }
  return data;
};

export const getScholarships = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/${query ? `?${query}` : ""}`);
};

export const getScholarship = (id) => request(`/${id}`);
export const createScholarship = (payload) => request("", { method: "POST", body: JSON.stringify(payload) });
export const updateScholarship = (id, payload) => request(`/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteScholarship = (id) => request(`/${id}`, { method: "DELETE" });
export const previewAward = (payload) => request("/preview", { method: "POST", body: JSON.stringify(payload) });
export const awardScholarship = (payload) => request("/award", { method: "POST", body: JSON.stringify(payload) });
export const getBeneficiaries = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/beneficiaries${query ? `?${query}` : ""}`);
};
export const renewAssignment = (id, payload) => request(`/renew/${id}`, { method: "POST", body: JSON.stringify(payload) });
export const cancelAssignment = (id, payload) => request(`/cancel/${id}`, { method: "POST", body: JSON.stringify(payload) });
export const getStudentScholarshipProfile = (id) => request(`/student/${id}`);
export const getReports = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/reports${query ? `?${query}` : ""}`);
};
