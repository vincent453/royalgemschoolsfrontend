import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingBag, FaBoxOpen, FaTimesCircle, FaShoppingCart,
  FaClock, FaCheckCircle, FaMoneyBillWave, FaChartLine,
  FaPlus, FaList, FaTags, FaUsers,
} from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getShopDashboard } from "../../services/shopApi";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />;

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>{icon}</div>
    <div>
      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-jost font-bold text-2xl text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="font-dm-sans text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const OrderStatusBadge = ({ status }) => {
  const map = {
    pending:    "bg-amber-100 text-amber-700",
    paid:       "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    ready:      "bg-purple-100 text-purple-700",
    delivered:  "bg-emerald-100 text-emerald-700",
    cancelled:  "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

export default function ShopDashboard() {
  const navigate   = useNavigate();
  const hasFetched = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getShopDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats ?? {};

  const statCards = [
    { icon: <FaShoppingBag />,   label: "Total Products",    value: s.totalProducts   ?? 0, color: "bg-[#f056f0]/10 text-[#f056f0]" },
    { icon: <FaBoxOpen />,       label: "Active Products",   value: s.activeProducts  ?? 0, color: "bg-emerald-100 text-emerald-600" },
    { icon: <FaTimesCircle />,   label: "Out of Stock",      value: s.outOfStock      ?? 0, color: "bg-red-100 text-red-500"         },
    { icon: <FaShoppingCart />,  label: "Total Orders",      value: s.totalOrders     ?? 0, color: "bg-blue-100 text-blue-600"       },
    { icon: <FaClock />,         label: "Pending Orders",    value: s.pendingOrders   ?? 0, color: "bg-amber-100 text-amber-600"     },
    { icon: <FaCheckCircle />,   label: "Completed Orders",  value: s.completedOrders ?? 0, color: "bg-teal-100 text-teal-600"       },
    { icon: <FaMoneyBillWave />, label: "Total Sales",       value: fmt(s.totalSales), color: "bg-green-100 text-green-600"         },
    { icon: <FaChartLine />,     label: "Monthly Sales",     value: fmt(s.monthlySales), color: "bg-violet-100 text-violet-600"     },
  ];

  const quickActions = [
    { icon: <FaPlus />,         label: "Add Product",    path: "/admin/shop/products/new"  },
    { icon: <FaList />,         label: "View Products",  path: "/admin/shop/products"      },
    { icon: <FaShoppingCart />, label: "Orders",         path: "/admin/shop/orders"        },
    { icon: <FaTags />,         label: "Categories",     path: "/admin/shop/categories"    },
    { icon: <FaUsers />,        label: "Customers",      path: "/admin/shop/customers"     },
    { icon: <FaChartLine />,    label: "Sales Report",   path: "/admin/shop/report"        },
  ];

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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="font-dm-sans text-sm text-gray-400">Shop / Dashboard</p>
              <h1 className="font-jost font-bold text-2xl text-gray-800 mt-1">Online Shop</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">
                Manage products, orders, and track sales performance.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
                {error}
              </div>
            )}

            {/* Stat cards */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map(c => <StatCard key={c.label} {...c} />)}
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-jost font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickActions.map(a => (
                  <button key={a.label} onClick={() => navigate(a.path)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100
                               hover:border-[#f056f0] hover:bg-[#f056f0]/5 transition-all duration-200 group">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-[#f056f0]/10
                                    flex items-center justify-center text-gray-400 group-hover:text-[#f056f0] transition-colors">
                      {a.icon}
                    </div>
                    <span className="font-dm-sans text-xs text-gray-500 group-hover:text-[#f056f0] font-medium text-center">
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-jost font-bold text-gray-800">Recent Orders</h2>
                <button onClick={() => navigate("/admin/shop/orders")}
                  className="font-dm-sans text-xs text-[#f056f0] hover:underline">View all</button>
              </div>

              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : !data?.recentOrders?.length ? (
                <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No orders yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Order No.","Customer","Items","Total","Status","Date"].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.recentOrders.map(o => (
                        <tr key={o._id} onClick={() => navigate(`/admin/shop/orders/${o._id}`)}
                          className="hover:bg-[#faf5ff] cursor-pointer transition-colors">
                          <td className="px-5 py-4 font-dm-sans text-xs font-semibold text-[#f056f0]">{o.orderNumber}</td>
                          <td className="px-5 py-4 font-dm-sans text-sm text-gray-700">{o.customer?.name}</td>
                          <td className="px-5 py-4 font-dm-sans text-sm text-gray-500">{o.items?.length} item(s)</td>
                          <td className="px-5 py-4 font-jost font-bold text-gray-800">{fmt(o.total)}</td>
                          <td className="px-5 py-4"><OrderStatusBadge status={o.orderStatus} /></td>
                          <td className="px-5 py-4 font-dm-sans text-xs text-gray-400">
                            {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}