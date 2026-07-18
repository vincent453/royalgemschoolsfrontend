import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaBoxOpen, FaReceipt, FaArrowLeft } from "react-icons/fa";
import { getMyOrders } from "../../services/shopApi";

const fmt     = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const statusColors = {
  pending:    "bg-amber-100 text-amber-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  ready:      "bg-purple-100 text-purple-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-600",
};

const payColors = {
  pending: "bg-amber-50 text-amber-600",
  paid:    "bg-emerald-50 text-emerald-700",
  failed:  "bg-red-50 text-red-600",
};

export default function MyOrders() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem("portalToken");
    if (!token) { navigate("/portal"); return; }

    getMyOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#E6EBEE]">
      <header className="sticky top-0 z-40 bg-[#f056f0] h-[60px] flex items-center px-6 gap-4 shadow-md">
        <button onClick={() => navigate("/portal")}
          className="text-white/80 hover:text-white transition-colors">
          <FaArrowLeft />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">My Orders</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm py-20 text-center">
            <FaShoppingBag className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="font-dm-sans text-sm text-gray-400 mb-4">You have no orders yet.</p>
            <button onClick={() => navigate("/portal/shop")}
              className="px-6 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-full
                         font-dm-sans text-sm font-semibold transition-colors">
              Browse Shop
            </button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                         hover:shadow-md transition-shadow duration-200">
              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4
                              border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f056f0]/10 flex items-center justify-center">
                    <FaShoppingBag className="text-[#f056f0] text-sm" />
                  </div>
                  <div>
                    <p className="font-dm-sans font-bold text-gray-700 text-sm">{order.orderNumber}</p>
                    <p className="font-dm-sans text-xs text-gray-400">{fmtDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans capitalize
                    ${statusColors[order.orderStatus] ?? "bg-gray-100 text-gray-500"}`}>
                    {order.orderStatus}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans capitalize
                    ${payColors[order.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="px-6 py-4 space-y-3">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.productName}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <FaBoxOpen className="text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-dm-sans text-sm text-gray-700 truncate">{item.productName}</p>
                      <p className="font-dm-sans text-xs text-gray-400">× {item.quantity} — {fmt(item.unitPrice)}</p>
                    </div>
                    <p className="font-jost font-bold text-sm text-gray-700 flex-shrink-0">
                      {fmt(item.subtotal)}
                    </p>
                  </div>
                ))}
                {(order.items?.length ?? 0) > 3 && (
                  <p className="font-dm-sans text-xs text-gray-400">
                    +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div>
                  <span className="font-dm-sans text-xs text-gray-400">Total </span>
                  <span className="font-jost font-bold text-[#f056f0]">{fmt(order.total)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {order.receiptNumber && (
                    <span className="font-dm-sans text-xs text-gray-400 flex items-center gap-1">
                      <FaReceipt className="text-gray-300" /> {order.receiptNumber}
                    </span>
                  )}
                  {order.paymentStatus !== "paid" && order.orderStatus === "pending" && (
                    <button
                      onClick={async () => {
                        try {
                          const { initializePayment } = await import("../../services/shopApi");
                          const { authorizationUrl } = await initializePayment(order._id);
                          window.location.href = authorizationUrl;
                        } catch (e) {
                          alert(e.message);
                        }
                      }}
                      className="px-4 py-1.5 bg-[#f056f0] hover:bg-[#525fe1] text-white rounded-full
                                 font-dm-sans text-xs font-semibold transition-colors">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}