import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { FaArrowUp, FaArrowDown, FaWallet, FaHistory, FaChartLine } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";
import SummaryCard from "../../components/accounting/SummaryCard";
import { getSummary, getIncomes, getExpenses } from "../../services/accountingApi";

Chart.register(...registerables);

const fmt = (n) =>
  `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const buildChartData = (incomes = [], expenses = []) => {
  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, idx) => {
    const date  = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const key   = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString("default", { month: "short", year: "numeric" });
    return { key, label };
  });

  const incomeMap  = Object.fromEntries(months.map((m) => [m.key, 0]));
  const expenseMap = Object.fromEntries(months.map((m) => [m.key, 0]));

  incomes.forEach((item) => {
    const date = new Date(item.date);
    if (isNaN(date)) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (key in incomeMap) incomeMap[key] += Number(item.amount || 0);
  });

  expenses.forEach((item) => {
    const date = new Date(item.date);
    if (isNaN(date)) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (key in expenseMap) expenseMap[key] += Number(item.amount || 0);
  });

  return {
    labels:   months.map((m) => m.label),
    income:   months.map((m) => incomeMap[m.key]  || 0),
    expenses: months.map((m) => expenseMap[m.key] || 0),
    net:      months.map((m) => (incomeMap[m.key] || 0) - (expenseMap[m.key] || 0)),
  };
};

// ── Chart component — isolated so it manages its own canvas ref ──
const OverviewChart = ({ chartData }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !chartData.labels.length) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");

    const gradientIncome = ctx.createLinearGradient(0, 0, 0, 200);
    gradientIncome.addColorStop(0, "rgba(16,185,129,0.35)");
    gradientIncome.addColorStop(1, "rgba(16,185,129,0)");

    const gradientExpense = ctx.createLinearGradient(0, 0, 0, 200);
    gradientExpense.addColorStop(0, "rgba(239,68,68,0.35)");
    gradientExpense.addColorStop(1, "rgba(239,68,68,0)");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label:              "Income",
            data:               chartData.income,
            borderColor:        "#10B981",
            backgroundColor:    gradientIncome,
            pointBackgroundColor:"#10B981",
            pointBorderColor:   "#ffffff",
            borderWidth:        3,
            tension:            0.4,
            fill:               true,
          },
          {
            label:              "Expenses",
            data:               chartData.expenses,
            borderColor:        "#EF4444",
            backgroundColor:    gradientExpense,
            pointBackgroundColor:"#EF4444",
            pointBorderColor:   "#ffffff",
            borderWidth:        3,
            tension:            0.4,
            fill:               true,
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#475569", usePointStyle: true, pointStyle: "circle" },
          },
          tooltip: {
            backgroundColor: "#334155",
            titleColor:      "#fff",
            bodyColor:       "#e2e8f0",
            padding:         10,
            cornerRadius:    12,
            callbacks: {
              label: (ctx) => ` ₦${Number(ctx.raw).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          x: {
            ticks:  { color: "#64748b", maxRotation: 0, minRotation: 0 },
            grid:   { display: false },
            border: { color: "#cbd5e1" },
          },
          y: {
            ticks:  { color: "#64748b", precision: 0,
              callback: (v) => `₦${Number(v).toLocaleString("en-NG")}` },
            grid:   { color: "#e2e8f0" },
            border: { color: "#cbd5e1" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [chartData]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
};

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
const AccountingDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary,     setSummary]     = useState(null);
  const [recent,      setRecent]      = useState([]);
  const [chartData,   setChartData]   = useState({ labels: [], income: [], expenses: [], net: [] });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, incomesRes, expensesRes] = await Promise.all([
          getSummary(),
          getIncomes({ limit: 20 }),
          getExpenses({ limit: 20 }),
        ]);

        // Backend returns { success, summary, charts, recent }
        // Support both shapes: direct object or nested under .summary
        const summaryData = summaryRes?.summary ?? summaryRes;
        setSummary(summaryData);

        const incomes  = Array.isArray(incomesRes?.income)   ? incomesRes.income   :
                         Array.isArray(incomesRes)            ? incomesRes           : [];
        const expenses = Array.isArray(expensesRes?.expenses) ? expensesRes.expenses :
                         Array.isArray(expensesRes)           ? expensesRes          : [];

        const merged = [
          ...incomes.map((i)  => ({ ...i, type: "Income",  label: i.title || i.category || "Income" })),
          ...expenses.map((e) => ({ ...e, type: "Expense", label: e.title || e.category || "Expense" })),
        ]
          .map((item) => ({ ...item, amount: Number(item.amount || 0) }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8);

        setRecent(merged);
        setChartData(buildChartData(incomes, expenses));
      } catch (err) {
        setError(err.message || "Unable to load accounting summary.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Backend field names: monthlyIncome / monthlyExpenses (not incomeThisMonth)
const monthlyIncome = summary?.incomeThisMonth ?? 0;
const monthlyExpenses = summary?.expensesThisMonth ?? 0;
  const totalIncome     = summary?.totalIncome     ?? 0;
  const totalExpenses   = summary?.totalExpenses   ?? 0;
  const netBalance      = totalIncome - totalExpenses;
  const monthlyBalance  = monthlyIncome - monthlyExpenses;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">

            {/* ── Header + Summary Cards ── */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Accounting / Dashboard</p>
                <h1 className="mt-2 text-2xl font-jost font-bold text-gray-900">Accounting Dashboard</h1>
                <p className="mt-2 text-sm text-gray-500">A snapshot of income, expenses, and recent transactions.</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-40 rounded-[28px] bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-600">{error}</div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                  <SummaryCard
                    label="Total Income"
                    value={fmt(totalIncome)}
                    description="All time income received"
                    icon={<FaArrowUp className="text-xl" />}
                    color="bg-green-100 text-green-700"
                  />
                  <SummaryCard
                    label="Total Expenses"
                    value={fmt(totalExpenses)}
                    description="All time expenses paid"
                    icon={<FaArrowDown className="text-xl" />}
                    color="bg-red-100 text-red-700"
                  />
                  <SummaryCard
                    label="Net Balance"
                    value={fmt(netBalance)}
                    description="Income minus expenses"
                    icon={<FaWallet className="text-xl" />}
                    color="bg-violet-100 text-violet-700"
                  />
                </div>
              )}
            </div>

            {/* ── Chart + Quick View ── */}
            <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Income vs Expenses</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">Last 6 months</h2>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><FaChartLine /></div>
                </div>

                {/* ✅ Single canvas — isolated in its own component with its own ref */}
                <div className="h-80">
                  <OverviewChart chartData={chartData} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Income",   value: monthlyIncome,   color: "bg-green-100 text-green-700"   },
                    { label: "Expenses", value: monthlyExpenses, color: "bg-red-100 text-red-700"       },
                    { label: "Net",      value: monthlyBalance,  color: "bg-violet-100 text-violet-700" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-3xl border border-gray-100 p-4 ${item.color}`}>
                      <p className="text-xs text-gray-500">{item.label} this month</p>
                      <p className="mt-2 text-xl font-semibold">{fmt(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Summary Snapshot</p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900">Quick view</h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-700">Total Income</p>
                    <p className="mt-2 text-3xl font-bold text-green-900">{fmt(totalIncome)}</p>
                  </div>
                  <div className="rounded-3xl bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">Total Expenses</p>
                    <p className="mt-2 text-3xl font-bold text-red-900">{fmt(totalExpenses)}</p>
                  </div>
                  <div className="rounded-3xl bg-violet-50 p-4">
                    <p className="text-sm font-medium text-violet-700">Net Balance</p>
                    <p className="mt-2 text-3xl font-bold text-violet-900">{fmt(netBalance)}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Monthly stat cards ── */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Income</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">{fmt(monthlyIncome)}</h2>
                  </div>
                  <div className="rounded-2xl bg-green-100 p-3 text-green-700"><FaChartLine /></div>
                </div>
                <p className="text-sm text-gray-500">Income collected this month.</p>
              </div>

              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Expenses</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">{fmt(monthlyExpenses)}</h2>
                  </div>
                  <div className="rounded-2xl bg-red-100 p-3 text-red-700"><FaArrowDown /></div>
                </div>
                <p className="text-sm text-gray-500">Expenses recorded this month.</p>
              </div>

              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Recent Activity</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">{recent.length}</h2>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><FaHistory /></div>
                </div>
                <p className="text-sm text-gray-500">Last {recent.length} transactions.</p>
              </div>
            </div>

            {/* ── Recent Transactions ── */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Recent Transactions</p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">Latest activity</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide text-xs">Type</th>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide text-xs">Title</th>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide text-xs hidden md:table-cell">Description</th>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide text-xs">Amount</th>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                          No recent transactions available.
                        </td>
                      </tr>
                    ) : (
                      recent.map((item) => (
                        <tr key={item._id} className="border-t border-gray-100 hover:bg-[#faf5ff] transition-colors">
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                              ${item.type === "Income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-700 font-medium">{item.label}</td>
                          <td className="px-4 py-4 text-gray-500 hidden md:table-cell truncate max-w-[250px]">
                            {item.description || "—"}
                          </td>
                          <td className={`px-4 py-4 font-semibold ${item.type === "Income" ? "text-emerald-600" : "text-red-600"}`}>
                            {item.type === "Income" ? "+" : "-"}{fmt(item.amount)}
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-xs">
                            {new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountingDashboard;