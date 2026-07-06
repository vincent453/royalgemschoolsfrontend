const BASE_URL = `${import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app"}/api/fees`;

const request = async (path, options = {}) => {
  const token = localStorage.getItem("portalToken");
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
    throw new Error(data.message || "Failed to fetch fee data.");
  }
  return data;
};

export const getMyFeeStatements = () => request("/me/all");
export const initializePaystackPayment = (feeStatementId) =>
  request("/paystack/initialize", {
    method: "POST",
    body: JSON.stringify({ feeStatementId }),
  });
