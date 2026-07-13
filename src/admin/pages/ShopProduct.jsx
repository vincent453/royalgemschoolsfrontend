import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaEllipsisV,
  FaBoxOpen, FaExclamationTriangle,
} from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getProducts, deleteProduct, getCategories } from "../../services/shopApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const StatusBadge = ({ status }) => {
  const map = {
    "Active":       "bg-emerald-100 text-emerald-700",
    "Inactive":     "bg-gray-100 text-gray-500",
    "Out of Stock": "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

const Skeleton = ({ rows = 6 }) => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-40" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
        </div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
      </div>
    ))}
  </div>
);

export default function ShopProducts() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [openMenu,    setOpenMenu]    = useState(null);
  const [toast,       setToast]       = useState(null);

  // filters
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [status,   setStatus]   = useState("");

  const LIMIT = 20;

  const fetchProducts = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getProducts({ search, category, status, page: p, limit: LIMIT });
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setPage(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetchProducts(1);
  }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchProducts(1); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      setTotal(t => t - 1);
      showToast("success", "Product deleted.");
    } catch (e) {
      showToast("error", e.message);
    }
    setOpenMenu(null);
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const pages = Math.ceil(total / LIMIT);

  const inputClass = `border border-gray-200 rounded-xl px-4 py-2.5 font-dm-sans text-sm text-gray-700
                      placeholder-gray-300 focus:outline-none focus:border-[#f056f0] transition-colors bg-white`;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-2xl text-gray-800">Products</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  {total} product{total !== 1 ? "s" : ""} in the shop
                </p>
              </div>
              <button onClick={() => navigate("/admin/shop/products/new")}
                className="flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                           px-5 py-2.5 rounded-full font-jost font-semibold text-sm transition-colors shadow-sm">
                <FaPlus className="text-xs" /> Add Product
              </button>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-3 items-end">
              <div className="relative flex-[2] min-w-[200px]">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                <input type="text" placeholder="Search products..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`${inputClass} pl-9 w-full`} />
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)} className={`${inputClass} flex-1 min-w-[150px]`}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select value={status} onChange={e => setStatus(e.target.value)} className={`${inputClass} flex-1 min-w-[140px]`}>
                <option value="">All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Out of Stock</option>
              </select>
              <button type="submit"
                className="px-6 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                           font-dm-sans text-sm font-semibold transition-colors">
                Search
              </button>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
                {error}
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-[3fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4
                              px-6 py-3 bg-gray-50 border-b border-gray-100">
                {["Product","Category","Price","Stock","Status","Sold",""].map((h, i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                ))}
              </div>

              {loading ? <Skeleton /> : products.length === 0 ? (
                <div className="py-20 text-center">
                  <FaBoxOpen className="text-4xl text-gray-200 mx-auto mb-3" />
                  <p className="font-dm-sans text-sm text-gray-400">No products found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {products.map(p => {
                    const stock = p.inventoryItem?.quantity ?? 0;
                    return (
                      <div key={p._id}
                        className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4
                                   px-6 py-4 items-center hover:bg-[#fdf8ff] transition-colors">
                        {/* Product */}
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.productName}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                              <FaBoxOpen className="text-[#f056f0]" />
                            </div>
                          )}
                          <div>
                            <p className="font-dm-sans font-semibold text-gray-700 text-sm">{p.productName}</p>
                            <p className="font-dm-sans text-xs text-gray-400">{p.productCode}</p>
                          </div>
                        </div>

                        <span className="font-dm-sans text-sm text-gray-500">{p.category?.name ?? "—"}</span>

                        <div>
                          {p.discountPrice ? (
                            <div>
                              <p className="font-jost font-bold text-sm text-[#f056f0]">{fmt(p.discountPrice)}</p>
                              <p className="font-dm-sans text-xs text-gray-300 line-through">{fmt(p.price)}</p>
                            </div>
                          ) : (
                            <p className="font-jost font-bold text-sm text-gray-700">{fmt(p.price)}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {stock <= (p.inventoryItem?.minimumStock ?? 0) && stock > 0 && (
                            <FaExclamationTriangle className="text-amber-400 text-xs" />
                          )}
                          <span className={`font-dm-sans font-semibold text-sm
                            ${stock === 0 ? "text-red-500" : stock <= (p.inventoryItem?.minimumStock ?? 0) ? "text-amber-600" : "text-gray-700"}`}>
                            {stock}
                          </span>
                        </div>

                        <StatusBadge status={p.status} />

                        <span className="font-dm-sans text-sm text-gray-500">{p.totalSold ?? 0}</span>

                        {/* Actions */}
                        <div className="relative">
                          <button onClick={() => setOpenMenu(openMenu === p._id ? null : p._id)}
                            className="text-gray-300 hover:text-[#f056f0] transition-colors p-1">
                            <FaEllipsisV className="text-sm" />
                          </button>
                          {openMenu === p._id && (
                            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100
                                            py-1 z-20 min-w-[140px]">
                              <button onClick={() => { navigate(`/admin/shop/products/${p._id}`); setOpenMenu(null); }}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-dm-sans
                                           text-gray-600 hover:bg-[#fdf8ff] hover:text-[#f056f0] transition-colors">
                                <FaEdit className="text-xs" /> Edit
                              </button>
                              <button onClick={() => handleDelete(p._id, p.productName)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-dm-sans
                                           text-red-400 hover:bg-red-50 transition-colors">
                                <FaTrash className="text-xs" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="font-dm-sans text-xs text-gray-400">
                    Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => fetchProducts(page - 1)} disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 font-dm-sans text-xs text-gray-600
                                 hover:border-[#f056f0] disabled:opacity-40 transition-colors">Prev</button>
                    <button onClick={() => fetchProducts(page + 1)} disabled={page === pages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 font-dm-sans text-xs text-gray-600
                                 hover:border-[#f056f0] disabled:opacity-40 transition-colors">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold
                         ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}