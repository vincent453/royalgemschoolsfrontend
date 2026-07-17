import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getOrders, updateOrderStatus } from "../../services/shopApi";

const fmt     = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const ORDER_STATUSES   = ["pending","paid","processing","ready","delivered","cancelled"];
const PAYMENT_STATUSES = ["pending","paid","failed","refunded"];

const statusColors = {
  pending:    "bg-amber-100 text-amber-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  ready:      "bg-purple-100 text-purple-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-600",
};

const payColors = {
  pending:  "bg-amber-50 text-amber-600",
  paid:     "bg-emerald-50 text-emerald-600",
  failed:   "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-500",
};

const Badge = ({ text, map }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans capitalize ${map[text] ?? "bg-gray-100 text-gray-500"}`}>
    {text}
  </span>
);

const Skeleton = () => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-4">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-32" />
        <div className="h-3 bg-gray-100 rounded animate-pulse flex-1" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
      </div>
    ))}
  </div>
);

export default function ShopOrders() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [orders,       setOrders]       = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [toast,        setToast]        = useState(null);
  const [updatingId,   setUpdatingId]   = useState(null);

  const [customer,      setCustomer]      = useState("");
  const [orderStatus,   setOrderStatus]   = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [startDate,     setStartDate]     = useState("");
  const [endDate,       setEndDate]       = useState("");

  const LIMIT = 20;

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getOrders({ customer, orderStatus, paymentStatus, startDate, endDate, page: p, limit: LIMIT });
      setOrders(data.orders ?? []);
      setTotal(data.total  ?? 0);
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
    fetchOrders(1);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      showToast("success", "Order status updated.");
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setUpdatingId(null);
    }
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

            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-2xl text-gray-800">Orders</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">{total} total order{total !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="relative flex-[2] min-w-[180px]">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <input type="text" placeholder="Search customer..." value={customer}
                    onChange={e => setCustomer(e.target.value)}
                    className={`${inputClass} pl-9 w-full`} />
                </div>
                <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} className={`${inputClass} flex-1 min-w-[140px]`}>
                  <option value="">All Order Status</option>
                  {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className={`${inputClass} flex-1 min-w-[140px]`}>
                  <option value="">All Payment Status</option>
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputClass} min-w-[140px]`} />
                <input type="date" value={endDate}   onChange={e => setEndDate(e.target.value)}   className={`${inputClass} min-w-[140px]`} />
                <button onClick={() => fetchOrders(1)}
                  className="px-6 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-xl
                             font-dm-sans text-sm font-semibold transition-colors">
                  Filter
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">{error}</div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_1.5fr_1fr] gap-3
                              px-6 py-3 bg-gray-50 border-b border-gray-100">
                {["Order No.","Customer","Items","Total","Payment","Order Status","Date"].map((h, i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                ))}
              </div>

              {loading ? <Skeleton /> : orders.length === 0 ? (
                <div className="py-20 text-center">
                  <FaShoppingCart className="text-4xl text-gray-200 mx-auto mb-3" />
                  <p className="font-dm-sans text-sm text-gray-400">No orders found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {orders.map(o => (
                    <div key={o._id}
                      className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1fr_1fr_1fr_1.5fr_1fr] gap-3
                                 px-6 py-4 items-center hover:bg-[#fdf8ff] transition-colors">
                      <button onClick={() => navigate(`/admin/shop/orders/${o._id}`)}
                        className="font-dm-sans text-xs font-bold text-[#f056f0] hover:underline text-left">
                        {o.orderNumber}
                      </button>
                      <div>
                        <p className="font-dm-sans font-semibold text-sm text-gray-700">{o.customer?.name}</p>
                        <p className="font-dm-sans text-xs text-gray-400">{o.customer?.phone}</p>
                      </div>
                      <span className="font-dm-sans text-sm text-gray-500">{o.items?.length} item(s)</span>
                      <span className="font-jost font-bold text-sm text-gray-800">{fmt(o.total)}</span>
                      <Badge text={o.paymentStatus} map={payColors} />

                      {/* Inline status updater */}
                      <select
                        value={o.orderStatus}
                        onChange={e => handleStatusChange(o._id, e.target.value)}
                        disabled={updatingId === o._id}
                        className={`border rounded-lg px-2 py-1.5 font-dm-sans text-xs capitalize
                                    focus:outline-none focus:border-[#f056f0] transition-colors
                                    ${statusColors[o.orderStatus] ?? "bg-gray-100 text-gray-600"}
                                    ${updatingId === o._id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        {ORDER_STATUSES.map(s => (
                          <option key={s} value={s} className="capitalize bg-white text-gray-700">{s}</option>
                        ))}
                      </select>

                      <span className="font-dm-sans text-xs text-gray-400">{fmtDate(o.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}

              {pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="font-dm-sans text-xs text-gray-400">
                    Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => fetchOrders(page - 1)} disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 font-dm-sans text-xs
                                 hover:border-[#f056f0] disabled:opacity-40 transition-colors">Prev</button>
                    <button onClick={() => fetchOrders(page + 1)} disabled={page === pages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 font-dm-sans text-xs
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