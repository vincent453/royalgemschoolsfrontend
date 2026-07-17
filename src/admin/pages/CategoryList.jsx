import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaEdit, FaTrash, FaTags, FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import Slidebar from "../components/layout/Slidebar";
import Topbar   from "../components/layout/Topbar";
import { getCategories, deleteCategory } from "../../services/shopApi";

const PAGE_SIZE = 10;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ── Skeleton row ──────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="grid grid-cols-[48px_1fr_1.5fr_80px_80px_70px_110px_100px] gap-4 px-6 py-4 items-center border-b border-gray-50 last:border-0">
    <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
    {[120, 180, 60, 60, 50, 90, 80].map((w, i) => (
      <div key={i} className={`h-3 bg-gray-100 rounded animate-pulse`} style={{ width: w }} />
    ))}
  </div>
);

// ── Status badge ──────────────────────────────────────────────
const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans
    ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
    {isActive
      ? <><FaCheckCircle className="text-[10px]" /> Active</>
      : <><FaTimesCircle className="text-[10px]" /> Inactive</>}
  </span>
);

// ── Delete confirm modal ──────────────────────────────────────
const DeleteModal = ({ category, loading, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
        <FaTrash className="text-red-500" />
      </div>
      <h3 className="font-jost font-bold text-gray-800 text-lg mb-1">Delete Category</h3>
      <p className="font-dm-sans text-sm text-gray-500 mb-6">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-gray-700">"{category.name}"</span>?
        This cannot be undone, and will fail if products are linked to it.
      </p>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full border border-gray-200 font-dm-sans text-sm
                     font-semibold text-gray-600 hover:border-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-dm-sans
                     text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CategoryList() {
  const navigate = useNavigate();
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [page,          setPage]          = useState(1);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [toast,         setToast]         = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const pageData   = categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget._id);
      showToast("success", `"${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      setPage(1);
      load();
    } catch (e) {
      showToast("error", e.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      {/* Topbar */}
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-dm-sans text-sm text-gray-400">Shop</p>
                <h1 className="font-jost font-bold text-2xl text-gray-800 mt-0.5">Shop Categories</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-1">
                  {loading ? "Loading…" : `${categories.length} categor${categories.length !== 1 ? "ies" : "y"} total`}
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/shop/categories/new")}
                className="inline-flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                           px-5 py-2.5 rounded-full font-jost font-semibold text-sm
                           transition-colors duration-300 shadow-sm self-start sm:self-auto"
              >
                <FaPlus className="text-xs" /> New Category
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
                {error}
              </div>
            )}

            {/* ── Table card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Column headers */}
              <div className="hidden md:grid grid-cols-[48px_1fr_1.5fr_80px_80px_70px_110px_100px] gap-4
                              px-6 py-3 bg-gray-50 border-b border-gray-100">
                {["","Name","Description","Status","Products","Order","Created",""].map((h, i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">
                    {h}
                  </span>
                ))}
              </div>

              {/* Loading skeleton */}
              {loading && (
                <div>
                  {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
              )}

              {/* Empty state */}
              {!loading && categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#f056f0]/10 flex items-center justify-center">
                    <FaTags className="text-[#f056f0] text-2xl" />
                  </div>
                  <div className="text-center">
                    <p className="font-jost font-bold text-gray-700 text-lg">No categories yet</p>
                    <p className="font-dm-sans text-sm text-gray-400 mt-1">
                      Create your first category to start organising products.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/admin/shop/categories/new")}
                    className="inline-flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1] text-white
                               px-5 py-2.5 rounded-full font-jost font-semibold text-sm
                               transition-colors duration-300"
                  >
                    <FaPlus className="text-xs" /> New Category
                  </button>
                </div>
              )}

              {/* Rows */}
              {!loading && pageData.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {pageData.map((cat) => (
                    <div
                      key={cat._id}
                      className="grid grid-cols-1 md:grid-cols-[48px_1fr_1.5fr_80px_80px_70px_110px_100px]
                                 gap-4 px-6 py-4 items-center hover:bg-[#fdf8ff] transition-colors duration-150"
                    >
                      {/* Image */}
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#f056f0]/10 flex items-center justify-center shrink-0">
                          <FaTags className="text-[#f056f0] text-base" />
                        </div>
                      )}

                      {/* Name */}
                      <div className="min-w-0">
                        <p className="font-dm-sans font-semibold text-gray-800 text-sm truncate">{cat.name}</p>
                        <p className="font-dm-sans text-xs text-gray-400 truncate mt-0.5">{cat.slug}</p>
                      </div>

                      {/* Description */}
                      <p className="font-dm-sans text-sm text-gray-500 truncate hidden md:block">
                        {cat.description || <span className="text-gray-300 italic">No description</span>}
                      </p>

                      {/* Status */}
                      <StatusBadge isActive={cat.isActive !== false} />

                      {/* Products count */}
                      <div className="text-center">
                        <span className="font-jost font-bold text-gray-700 text-sm">
                          {cat.productCount ?? "—"}
                        </span>
                      </div>

                      {/* Sort order */}
                      <div className="text-center">
                        <span className="font-dm-sans text-sm text-gray-500">{cat.sortOrder ?? 0}</span>
                      </div>

                      {/* Created */}
                      <span className="font-dm-sans text-xs text-gray-400 whitespace-nowrap hidden md:block">
                        {fmtDate(cat.createdAt)}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/shop/categories/${cat._id}`)}
                          title="Edit"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100
                                     text-blue-600 text-xs font-dm-sans font-semibold rounded-full
                                     transition-colors duration-200"
                        >
                          <FaEdit className="text-xs" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          title="Delete"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100
                                     text-red-500 text-xs font-dm-sans font-semibold rounded-full
                                     transition-colors duration-200"
                        >
                          <FaTrash className="text-xs" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row
                                items-center justify-between gap-3">
                  <p className="font-dm-sans text-xs text-gray-400">
                    Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, categories.length)} of {categories.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                      className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans
                                 font-semibold text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0]
                                 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="font-dm-sans text-xs text-gray-500 px-1">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="px-4 py-2 rounded-full border border-gray-200 text-xs font-dm-sans
                                 font-semibold text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0]
                                 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Delete modal ── */}
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl
                      shadow-lg font-dm-sans text-sm font-semibold transition-all duration-300
                      ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}