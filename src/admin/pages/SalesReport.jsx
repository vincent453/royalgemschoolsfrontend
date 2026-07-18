import { useState, useEffect, useRef } from "react";
import {
  FaChartLine, FaBoxOpen, FaUsers, FaTrophy,
  FaArrowUp, FaCalendarAlt,
} from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getSalesReport } from "../../services/shopApi";

const fmt     = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />;

const PeriodCard = ({ label, total, count, color }) => (
  <div className={`rounded-2xl p-5 border border-gray-100 shadow-sm ${color}`}>
    <div className="flex items-center justify-between mb-3">
      <p className="font-dm-sans text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <FaArrowUp className="opacity-50 text-sm" />
    </div>
    <p className="font-jost font-bold text-2xl">{fmt(total)}</p>
    <p className="font-dm-sans text-xs opacity-60 mt-1">{count} order{count !== 1 ? "s" : ""}</p>
  </div>
);

export default function SalesReport() {
  const hasFetched    = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [report,      setReport]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getSalesReport()
      .then(setReport)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
          <div className="max-w-6xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="font-dm-sans text-sm text-gray-400">Shop / Sales Report</p>
              <h1 className="font-jost font-bold text-2xl text-gray-800 mt-1">Sales Report</h1>
              <p className="font-dm-sans text-sm text-gray-400 mt-1">
                Overview of shop sales across all time periods.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
                {error}
              </div>
            )}

            {/* Period cards */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PeriodCard
                  label="Today"
                  total={report?.todaySales?.total   ?? 0}
                  count={report?.todaySales?.count   ?? 0}
                  color="bg-[#f056f0]/5 text-[#f056f0]"
                />
                <PeriodCard
                  label="This Week"
                  total={report?.weeklySales?.total  ?? 0}
                  count={report?.weeklySales?.count  ?? 0}
                  color="bg-blue-50 text-blue-700"
                />
                <PeriodCard
                  label="This Month"
                  total={report?.monthlySales?.total ?? 0}
                  count={report?.monthlySales?.count ?? 0}
                  color="bg-emerald-50 text-emerald-700"
                />
                <PeriodCard
                  label="This Year"
                  total={report?.yearlySales?.total  ?? 0}
                  count={report?.yearlySales?.count  ?? 0}
                  color="bg-violet-50 text-violet-700"
                />
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">

              {/* Best Selling Products */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <FaTrophy className="text-[#f056f0]" />
                  <h2 className="font-jost font-bold text-gray-800">Best Selling Products</h2>
                </div>

                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : !report?.topProducts?.length ? (
                  <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No sales data yet.</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {report.topProducts.map((p, i) => (
                      <div key={p._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-jost font-bold text-xs flex-shrink-0
                          ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-500" : "bg-orange-50 text-orange-400"}`}>
                          {i + 1}
                        </span>
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.productName}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                            <FaBoxOpen className="text-[#f056f0] text-xs" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-dm-sans font-semibold text-gray-700 text-sm truncate">{p.productName}</p>
                          <p className="font-dm-sans text-xs text-gray-400">{p.totalSold ?? 0} units sold</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-jost font-bold text-emerald-600 text-sm">{fmt(p.totalRevenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Customers */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <FaUsers className="text-[#f056f0]" />
                  <h2 className="font-jost font-bold text-gray-800">Top Customers</h2>
                </div>

                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : !report?.topCustomers?.length ? (
                  <div className="py-16 text-center font-dm-sans text-sm text-gray-400">No customer data yet.</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {report.topCustomers.map((c, i) => (
                      <div key={c._id ?? i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-jost font-bold text-xs flex-shrink-0
                          ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                          {i + 1}
                        </span>
                        <div className="w-9 h-9 rounded-full bg-[#f056f0]/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-jost font-bold text-[#f056f0] text-xs">
                            {c.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "??"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-dm-sans font-semibold text-gray-700 text-sm truncate">{c.name}</p>
                          <p className="font-dm-sans text-xs text-gray-400">{c.orders} order{c.orders !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-jost font-bold text-[#f056f0] text-sm">{fmt(c.totalSpent)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}