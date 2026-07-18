import { useState, useEffect, useRef } from "react";
import { FaSearch, FaUsers, FaShoppingBag } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar   from "../../admin/components/layout/Topbar";
import { getCustomers } from "../../services/shopApi";

const fmt     = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const AVATAR_COLORS = [
  "bg-purple-200 text-purple-800", "bg-blue-200 text-blue-800",
  "bg-green-200 text-green-800",   "bg-orange-200 text-orange-800",
  "bg-pink-200 text-pink-800",     "bg-teal-200 text-teal-800",
];

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const Skeleton = () => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-36" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
        </div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
      </div>
    ))}
  </div>
);

export default function ShopCustomers() {
  const hasFetched    = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers,   setCustomers]   = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getCustomers()
      .then(data => {
        const list = data.customers ?? [];
        setCustomers(list);
        setFiltered(list);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    const q = val.toLowerCase();
    setFiltered(
      customers.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      )
    );
  };

  const totalRevenue = customers.reduce((s, c) => s + (c.totalSpent ?? 0), 0);

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-2xl text-gray-800">Customers</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  Parents and students who have purchased from the shop
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Total Customers",   value: customers.length,               color: "text-gray-800",    icon: <FaUsers /> },
                { label: "Total Orders",      value: customers.reduce((s, c) => s + (c.totalOrders ?? 0), 0), color: "text-blue-600", icon: <FaShoppingBag /> },
                { label: "Total Revenue",     value: fmt(totalRevenue),              color: "text-emerald-600", icon: <FaShoppingBag /> },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-2">{s.label}</p>
                  <p className={`font-jost font-bold text-2xl ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="relative max-w-sm">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                <input type="text" placeholder="Search by name, email or phone..."
                  value={search} onChange={e => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-dm-sans text-sm
                             text-gray-700 focus:outline-none focus:border-[#f056f0] transition-colors" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-3 rounded-2xl font-dm-sans text-sm">
                {error}
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-[2.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr] gap-4 px-6 py-3
                              bg-gray-50 border-b border-gray-100">
                {["Customer","Email / Phone","Orders","Total Spent","Last Purchase",""].map((h, i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                ))}
              </div>

              {loading ? <Skeleton /> : filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <FaUsers className="text-4xl text-gray-200 mx-auto mb-3" />
                  <p className="font-dm-sans text-sm text-gray-400">
                    {search ? "No customers match your search." : "No customers yet."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map((c, i) => (
                    <div key={c._id ?? i}
                      className="grid grid-cols-1 md:grid-cols-[2.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr] gap-4
                                 px-6 py-4 items-center hover:bg-[#fdf8ff] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                         font-jost font-bold text-xs flex-shrink-0
                                         ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                          {getInitials(c.name)}
                        </div>
                        <span className="font-dm-sans font-semibold text-gray-700 text-sm">{c.name}</span>
                      </div>
                      <div>
                        {c.email && <p className="font-dm-sans text-xs text-gray-500 truncate">{c.email}</p>}
                        {c.phone && <p className="font-dm-sans text-xs text-gray-400">{c.phone}</p>}
                      </div>
                      <span className="font-dm-sans text-sm text-gray-700 font-semibold">
                        {c.totalOrders ?? 0} order{(c.totalOrders ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <span className="font-jost font-bold text-emerald-600 text-sm">{fmt(c.totalSpent)}</span>
                      <span className="font-dm-sans text-xs text-gray-400">{fmtDate(c.lastPurchase)}</span>
                      <div />
                    </div>
                  ))}
                </div>
              )}

              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50">
                <p className="font-dm-sans text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-gray-600">{customers.length}</span> customers
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}