import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { FaArrowUp, FaArrowDown, FaWallet, FaHistory, FaChartLine } from "react-icons/fa";
import Slidebar from "../../admin/components/layout/Slidebar";
import Topbar from "../../admin/components/layout/Topbar";
import SummaryCard from "../../components/accounting/SummaryCard";
import { getSummary, getIncomes, getExpenses } from "../../services/accountingApi";

Chart.register(...registerables);

const buildChartData = (incomes = [], expenses = []) => {
  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, idx) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString("default", { month: "short", year: "numeric" });
    return { key, label };
  });

  const incomeMap = Object.fromEntries(months.map((month) => [month.key, 0]));
  const expenseMap = Object.fromEntries(months.map((month) => [month.key, 0]));

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
    labels: months.map((month) => month.label),
    income: months.map((month) => incomeMap[month.key] || 0),
    expenses: months.map((month) => expenseMap[month.key] || 0),
    net: months.map((month) => (incomeMap[month.key] || 0) - (expenseMap[month.key] || 0)),
  };
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], income: [], expenses: [], net: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryData, incomes, expenses] = await Promise.all([
          getSummary(),
          getIncomes({ limit: 20 }),
          getExpenses({ limit: 20 }),
        ]);
        setSummary(summaryData);

        const merged = [
          ...(Array.isArray(incomes) ? incomes : []),
          ...(Array.isArray(expenses) ? expenses : []),
        ]
          .map((item) => ({
            ...item,
            type: item.source ? "Income" : "Expense",
            label: item.source || item.category || "Transaction",
            amount: Number(item.amount || 0),
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);

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
            label: "Income",
            data: chartData.income,
            borderColor: "#10B981",
            backgroundColor: gradientIncome,
            pointBackgroundColor: "#10B981",
            pointBorderColor: "#ffffff",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
          {
            label: "Expenses",
            data: chartData.expenses,
            borderColor: "#EF4444",
            backgroundColor: gradientExpense,
            pointBackgroundColor: "#EF4444",
            pointBorderColor: "#ffffff",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#475569", usePointStyle: true, pointStyle: "circle" },
          },
          tooltip: {
            backgroundColor: "#334155",
            titleColor: "#fff",
            bodyColor: "#e2e8f0",
            padding: 10,
            cornerRadius: 12,
          },
        },
        scales: {
          x: {
            ticks: { color: "#64748b", maxRotation: 0, minRotation: 0 },
            grid: { display: false },
            border: { color: "#cbd5e1" },
          },
          y: {
            ticks: { color: "#64748b", precision: 0 },
            grid: { color: "#e2e8f0" },
            border: { color: "#cbd5e1" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [chartData]);

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
                    value={`₦${summary?.totalIncome?.toFixed(2) ?? "0.00"}`}
                    description="All time income received"
                    icon={<FaArrowUp className="text-xl" />}
                    color="bg-green-100 text-green-700"
                  />
                  <SummaryCard
                    label="Total Expenses"
                    value={`₦${summary?.totalExpenses?.toFixed(2) ?? "0.00"}`}
                    description="All time expenses paid"
                    icon={<FaArrowDown className="text-xl" />}
                    color="bg-red-100 text-red-700"
                  />
                  <SummaryCard
                    label="Net Balance"
                    value={`₦${((summary?.totalIncome || 0) - (summary?.totalExpenses || 0)).toFixed(2)}`}
                    description="Income minus expenses"
                    icon={<FaWallet className="text-xl" />}
                    color="bg-violet-100 text-violet-700"
                  />
                </div>
              )}
            </div>

            <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Income vs Expenses</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">Last 6 months</h2>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><FaChartLine /></div>
                </div>

                <div className="h-80">
                  <canvas ref={canvasRef} className="h-full w-full" />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Income", value: summary?.incomeThisMonth ?? 0, color: "bg-green-100 text-green-700" },
                    { label: "Expenses", value: summary?.expensesThisMonth ?? 0, color: "bg-red-100 text-red-700" },
                    { label: "Net", value: (summary?.incomeThisMonth || 0) - (summary?.expensesThisMonth || 0), color: "bg-violet-100 text-violet-700" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-3xl border border-gray-100 p-4 ${item.color.split(" ")[0]} ${item.color.split(" ")[1]}`}>
                      <p className="text-xs text-gray-500">{item.label} this month</p>
                      <p className="mt-2 text-xl font-semibold">₦{item.value.toFixed(2)}</p>
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
                    <p className="mt-2 text-3xl font-bold text-green-900">₦{summary?.totalIncome?.toFixed(2) ?? "0.00"}</p>
                  </div>
                  <div className="rounded-3xl bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">Total Expenses</p>
                    <p className="mt-2 text-3xl font-bold text-red-900">₦{summary?.totalExpenses?.toFixed(2) ?? "0.00"}</p>
                  </div>
                  <div className="rounded-3xl bg-violet-50 p-4">
                    <p className="text-sm font-medium text-violet-700">Net Balance</p>
                    <p className="mt-2 text-3xl font-bold text-violet-900">₦{((summary?.totalIncome || 0) - (summary?.totalExpenses || 0)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Income</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">₦{summary?.incomeThisMonth?.toFixed(2) ?? "0.00"}</h2>
                  </div>
                  <div className="rounded-2xl bg-green-100 p-3 text-green-700"><FaChartLine /></div>
                </div>
                <p className="text-sm text-gray-500">Income collected this month.</p>
              </div>

              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Expenses</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">₦{summary?.expensesThisMonth?.toFixed(2) ?? "0.00"}</h2>
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

            <section className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Income vs Expenses</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">Last 6 months</h2>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><FaChartLine /></div>
                </div>

                <div className="h-80">
                  <canvas ref={canvasRef} className="h-full w-full" />
                </div>
              </div>

              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Monthly snapshot</p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900">This month</h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Income",
                      value: summary?.incomeThisMonth ?? 0,
                      color: "bg-green-50 text-green-700",
                      border: "border-green-200",
                    },
                    {
                      label: "Expenses",
                      value: summary?.expensesThisMonth ?? 0,
                      color: "bg-red-50 text-red-700",
                      border: "border-red-200",
                    },
                    {
                      label: "Net",
                      value: (summary?.incomeThisMonth || 0) - (summary?.expensesThisMonth || 0),
                      color: "bg-violet-50 text-violet-700",
                      border: "border-violet-200",
                    },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-3xl border p-4 ${item.border} ${item.color}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                      <p className="mt-3 text-3xl font-bold">₦{item.value.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Recent Transactions</p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900">Latest activity</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide">Title</th>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide">Amount</th>
                      <th className="px-4 py-3 text-gray-500 uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((item) => (
                      <tr key={item._id} className="border-t border-gray-100 hover:bg-[#faf5ff] transition-colors">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-800">{item.type}</td>
                        <td className="px-4 py-4 text-gray-700">{item.label}</td>
                        <td className="px-4 py-4 text-gray-500 hidden md:table-cell truncate max-w-[250px]">{item.description || "—"}</td>
                        <td className={`px-4 py-4 font-semibold ${item.type === "Income" ? "text-emerald-600" : "text-red-600"}`}>
                          {item.type === "Income" ? "+" : "-"}₦{item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-gray-700">{new Date(item.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {recent.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-400">No recent transactions available.</td>
                      </tr>
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

export default Dashboard;
