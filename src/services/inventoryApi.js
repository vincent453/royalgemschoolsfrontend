const API = "https://royalgemschoolsbackend.vercel.app/api";

const h = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

const q = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") qs.set(k, v); });
  return qs.toString();
};

// ── Dashboard report ─────────────────────────────────────────
export const getInventoryReport  = () => fetch(`${API}/inventory/report`,       { headers: h() }).then(handle);
export const getLowStock         = () => fetch(`${API}/inventory/low-stock`,     { headers: h() }).then(handle);
export const getOutOfStock       = () => fetch(`${API}/inventory/out-of-stock`,  { headers: h() }).then(handle);

// ── Inventory CRUD ────────────────────────────────────────────
export const getInventory        = (p = {}) => fetch(`${API}/inventory?${q(p)}`, { headers: h() }).then(handle);
export const getInventoryItem    = (id) => fetch(`${API}/inventory/${id}`,        { headers: h() }).then(handle);
export const createInventoryItem = (body) => fetch(`${API}/inventory`,            { method: "POST", headers: h(), body: JSON.stringify(body) }).then(handle);
export const updateInventoryItem = (id, body) => fetch(`${API}/inventory/${id}`,  { method: "PUT",  headers: h(), body: JSON.stringify(body) }).then(handle);
export const deleteInventoryItem = (id) => fetch(`${API}/inventory/${id}`,        { method: "DELETE", headers: h() }).then(handle);

// ── Stock movements ───────────────────────────────────────────
export const stockIn   = (body) => fetch(`${API}/inventory/stock-in`,  { method: "POST", headers: h(), body: JSON.stringify(body) }).then(handle);
export const stockOut  = (body) => fetch(`${API}/inventory/stock-out`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(handle);
export const adjustStock = (body) => fetch(`${API}/inventory/adjust`,  { method: "POST", headers: h(), body: JSON.stringify(body) }).then(handle);

// ── Purchases ─────────────────────────────────────────────────
export const getPurchases    = (p = {}) => fetch(`${API}/inventory/purchases?${q(p)}`, { headers: h() }).then(handle);
export const recordPurchase  = (body) => fetch(`${API}/inventory/purchase`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(handle);

// ── Suppliers ─────────────────────────────────────────────────
export const getSuppliers    = () => fetch(`${API}/suppliers`,          { headers: h() }).then(handle);
export const createSupplier  = (body) => fetch(`${API}/suppliers`,      { method: "POST", headers: h(), body: JSON.stringify(body) }).then(handle);
export const updateSupplier  = (id, body) => fetch(`${API}/suppliers/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(handle);
export const deleteSupplier  = (id) => fetch(`${API}/suppliers/${id}`,  { method: "DELETE", headers: h() }).then(handle);
EOFILE
echo "API service done"