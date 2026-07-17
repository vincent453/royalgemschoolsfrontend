import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaCheckCircle, FaClock, FaTruck, FaBoxOpen, FaTimes } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getOrder, updateOrderStatus } from "../../services/shopApi";

const fmt     = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const ORDER_STATUSES = ["pending","paid","processing","ready","delivered","cancelled"];

const timelineSteps = [
  { status: "pending",    label: "Order Placed",   icon: <FaClock />        },
  { status: "paid",       label: "Payment Received",icon: <FaCheckCircle /> },
  { status: "processing", label: "Processing",     icon: <FaBoxOpen />      },
  { status: "ready",      label: "Ready",          icon: <FaBoxOpen />      },
  { status: "delivered",  label: "Delivered",      icon: <FaTruck />        },
];

const statusColors = {
  pending:    "bg-amber-100 text-amber-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  ready:      "bg-purple-100 text-purple-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-600",
};

export default function OrderDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [order,       setOrder]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [updating,    setUpdating]    = useState(false);
  const [toast,       setToast]       = useState(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getOrder(id)
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(id, newStatus);
      setOrder(prev => ({ ...prev, orderStatus: newStatus }));
      showToast("success", `Order status updated to "${newStatus}"`);
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setUpdating(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const currentStepIndex = timelineSteps.findIndex(s => s.status === order?.orderStatus);

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#E6EBEE]">
        <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p => !p)} /></div>
        <div className="flex flex-1 overflow-hidden">
          <div className="-mt-16"><Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></div>
          <main className="w-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
              {[140, 200, 260, 180].map((h, i) => (
                <div key={i} style={{ height: h }} className="bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#E6EBEE]">
        <div className="sticky top-0 z-50 w-full"><Topbar onMenuToggle={() => setSidebarOpen(p => !p)} /></div>
        <div className="flex flex-1 items-center justify-center">
          <div className="bg-white rounded-2xl p-10 text-center">
            <p className="text-red-500 font-dm-sans text-sm mb-4">{error || "Order not found."}</p>
            <button onClick={() => navigate("/admin/shop/orders")}
              className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-[#f056f0]">
              <FaArrowLeft /> Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="max-w-5xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <button onClick={() => navigate("/admin/shop/orders")}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f056f0] mb-3 transition-colors">
                  <FaArrowLeft /> Back to Orders
                </button>
                <h1 className="font-jost font-bold text-2xl text-gray-800">{order.orderNumber}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold font-dm-sans capitalize
                    ${statusColors[order.orderStatus]}`}>{order.orderStatus}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold font-dm-sans capitalize
                    ${order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="font-dm-sans text-xs text-gray-400">{fmtDate(order.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl
                             font-dm-sans text-sm text-gray-600 hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">
                  <FaPrint /> Print Invoice
                </button>
                <select value={order.orderStatus} onChange={e => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className={`border rounded-xl px-4 py-2.5 font-dm-sans text-sm capitalize cursor-pointer
                              focus:outline-none focus:border-[#f056f0] transition-colors
                              ${updating ? "opacity-50 cursor-not-allowed" : ""}
                              ${statusColors[order.orderStatus]}`}>
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s} className="capitalize bg-white text-gray-700">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order timeline */}
            {order.orderStatus !== "cancelled" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-jost font-bold text-gray-800 mb-6">Order Timeline</h2>
                <div className="flex items-center gap-0">
                  {timelineSteps.map((step, i) => {
                    const done    = i <= currentStepIndex;
                    const current = i === currentStepIndex;
                    return (
                      <div key={step.status} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors
                            ${current ? "bg-[#f056f0] text-white ring-4 ring-[#f056f0]/20"
                              : done ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                            {step.icon}
                          </div>
                          <span className={`font-dm-sans text-[10px] text-center font-semibold
                            ${current ? "text-[#f056f0]" : done ? "text-emerald-600" : "text-gray-300"}`}>
                            {step.label}
                          </span>
                        </div>
                        {i < timelineSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 mb-6 transition-colors
                            ${i < currentStepIndex ? "bg-emerald-400" : "bg-gray-100"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Items — spans 2 cols */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-jost font-bold text-gray-800">Items Ordered ({order.items?.length})</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      {item.image ? (
                        <img src={item.image} alt={item.productName}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                          <FaBoxOpen className="text-[#f056f0]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-dm-sans font-semibold text-gray-700 text-sm truncate">{item.productName}</p>
                        <p className="font-dm-sans text-xs text-gray-400">{item.productCode}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-dm-sans text-xs text-gray-400">× {item.quantity}</p>
                        <p className="font-jost font-bold text-sm text-gray-700">{fmt(item.unitPrice)}</p>
                      </div>
                      <div className="text-right flex-shrink-0 min-w-[80px]">
                        <p className="font-dm-sans text-xs text-gray-400">Subtotal</p>
                        <p className="font-jost font-bold text-sm text-[#f056f0]">{fmt(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-6 py-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between font-dm-sans text-sm text-gray-500">
                    <span>Subtotal</span><span>{fmt(order.subtotal)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between font-dm-sans text-sm text-gray-500">
                      <span>Delivery Fee</span><span>{fmt(order.deliveryFee)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between font-dm-sans text-sm text-emerald-600">
                      <span>Discount</span><span>-{fmt(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-jost font-bold text-gray-800 text-lg pt-2 border-t border-gray-100">
                    <span>Total</span><span>{fmt(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="flex flex-col gap-4">
                {/* Customer */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-jost font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Customer</h3>
                  <div className="space-y-2">
                    <p className="font-dm-sans font-semibold text-gray-700 text-sm">{order.customer?.name}</p>
                    {order.customer?.email && <p className="font-dm-sans text-xs text-gray-400">{order.customer.email}</p>}
                    {order.customer?.phone && <p className="font-dm-sans text-xs text-gray-400">{order.customer.phone}</p>}
                  </div>
                  {order.deliveryAddress && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="font-dm-sans text-xs text-gray-400 mb-1">Delivery Address</p>
                      <p className="font-dm-sans text-sm text-gray-600">{order.deliveryAddress}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="font-dm-sans text-xs text-gray-400 mb-1">Notes</p>
                      <p className="font-dm-sans text-sm text-gray-600 italic">{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Payment */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-jost font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Payment</h3>
                  <div className="space-y-2.5 font-dm-sans text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Method</span>
                      <span className="font-semibold text-gray-700 capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={`font-semibold capitalize ${order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    {order.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Paid At</span>
                        <span className="font-semibold text-gray-700">{fmtDate(order.paidAt)}</span>
                      </div>
                    )}
                    {order.paystackReference && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reference</span>
                        <span className="font-semibold text-gray-600 text-xs">{order.paystackReference}</span>
                      </div>
                    )}
                    {order.receiptNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Receipt No.</span>
                        <span className="font-semibold text-[#f056f0] text-xs">{order.receiptNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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