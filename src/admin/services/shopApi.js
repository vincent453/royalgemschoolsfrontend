const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/shop`
  : "https://royalgemschoolsbackend.onrender.com/api/shop";

const h = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const portalH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("portalToken")}`,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

const q = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  return qs.toString();
};

// ── Admin ─────────────────────────────────────────────────────
export const getShopDashboard  = ()         => fetch(`${API}/dashboard`,  { headers: h() }).then(handle);
export const getSalesReport    = ()         => fetch(`${API}/report`,     { headers: h() }).then(handle);
export const getCustomers      = ()         => fetch(`${API}/customers`,  { headers: h() }).then(handle);

// Categories
export const getCategories     = ()         => fetch(`${API}/categories`, { headers: h() }).then(handle);
export const createCategory    = (fd)       => fetch(`${API}/categories`, { method: "POST",   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: fd }).then(handle);
export const updateCategory    = (id, fd)   => fetch(`${API}/categories/${id}`, { method: "PUT", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: fd }).then(handle);
export const deleteCategory    = (id)       => fetch(`${API}/categories/${id}`, { method: "DELETE", headers: h() }).then(handle);

// Products
export const getProducts       = (p = {})  => fetch(`${API}/products?${q(p)}`,   { headers: h() }).then(handle);
export const getProduct        = (id)      => fetch(`${API}/products/${id}`,      { headers: h() }).then(handle);
export const createProduct     = (fd)      => fetch(`${API}/products`,            { method: "POST",   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: fd }).then(handle);
export const updateProduct     = (id, fd)  => fetch(`${API}/products/${id}`,      { method: "PUT",    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: fd }).then(handle);
export const deleteProduct     = (id)      => fetch(`${API}/products/${id}`,      { method: "DELETE", headers: h() }).then(handle);

// Orders
export const getOrders         = (p = {})  => fetch(`${API}/orders?${q(p)}`,     { headers: h() }).then(handle);
export const getOrder          = (id)      => fetch(`${API}/orders/${id}`,        { headers: h() }).then(handle);
export const updateOrderStatus = (id, status) => fetch(`${API}/orders/${id}/status`, { method: "PATCH", headers: h(), body: JSON.stringify({ orderStatus: status }) }).then(handle);

// ── Public / Portal ───────────────────────────────────────────
export const getPublicProducts  = (p = {}) => fetch(`${API}/public/products?${q(p)}`).then(handle);
export const getPublicCategories = ()      => fetch(`${API}/public/categories`).then(handle);

export const placeOrder          = (body)  => fetch(`${API}/orders`,              { method: "POST", headers: portalH(), body: JSON.stringify(body) }).then(handle);
export const initializePayment   = (id)    => fetch(`${API}/orders/${id}/pay`,    { method: "POST", headers: portalH() }).then(handle);
export const getMyOrders         = ()      => fetch(`${API}/my-orders`,           { headers: portalH() }).then(handle);