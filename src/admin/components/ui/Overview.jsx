import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const TABS = ["Week", "Month", "Year", "All"];

// Group results by month label
const groupByMonth = (items, dateField = "createdAt") => {
  const counts = {};
  items.forEach(item => {
    const d = new Date(item[dateField]);
    if (isNaN(d)) return;
    const label = d.toLocaleString("default", { month: "short" });
    counts[label] = (counts[label] || 0) + 1;
  });
  return counts;
};

const Overview = () => {
  const canvasRef  = useRef(null);
  const chartRef   = useRef(null);
  const [activeTab, setActiveTab] = useState("Week");
  const [chartData, setChartData] = useState({ labels: [], enrollment: [], results: [] });

  useEffect(() => {
    const token   = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch("https://royalgemschoolsbackend.vercel.app/api/students", { headers }).then(r => r.json()),
      fetch("https://royalgemschoolsbackend.vercel.app/api/results",  { headers }).then(r => r.json()),
    ]).then(([studentsRes, resultsRes]) => {
      const students = studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value)
        ? studentsRes.value : [];
      const results  = resultsRes.status === "fulfilled"  && Array.isArray(resultsRes.value)
        ? resultsRes.value  : [];

      const enrollmentByMonth = groupByMonth(students);
      const resultsByMonth    = groupByMonth(results);

      const allLabels = Array.from(
        new Set([...Object.keys(enrollmentByMonth), ...Object.keys(resultsByMonth)])
      );

      // Sort labels by month order
      const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      allLabels.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

      setChartData({
        labels:     allLabels.length ? allLabels : ["No data"],
        enrollment: allLabels.map(l => enrollmentByMonth[l] || 0),
        results:    allLabels.map(l => resultsByMonth[l]    || 0),
      });
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !chartData.labels.length) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");

    const revenueGrad = ctx.createLinearGradient(0, 0, 0, 180);
    revenueGrad.addColorStop(0, "rgba(16,185,129,0.5)");
    revenueGrad.addColorStop(1, "rgba(16,185,129,0)");

    chartRef.current = new Chart(ctx, {
      data: {
        labels: chartData.labels,
        datasets: [
          {
            type: "bar",
            label: "Enrollments",
            data: chartData.enrollment,
            backgroundColor: "#5B4FE9",
            borderRadius: 6,
            barThickness: 10,
          },
          {
            type: "line",
            label: "Results Uploaded",
            data: chartData.results,
            borderColor: "#10B981",
            backgroundColor: revenueGrad,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#10B981",
            tension: 0.45,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1E1B4B",
            titleColor: "#fff",
            bodyColor: "rgba(255,255,255,0.7)",
            padding: 10,
            cornerRadius: 10,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 10 } },
            border: { display: false },
          },
          y: {
            grid: { color: "#f1f5f9" },
            ticks: { color: "#94a3b8", font: { size: 10 }, stepSize: 1 },
            border: { display: false },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [chartData, activeTab]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-[15px]">School Overview</h3>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex items-center gap-5 mt-3">
        {[
          { color: "bg-violet-600", label: "Enrollments" },
          { color: "bg-emerald-500", label: "Results Uploaded" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[11px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;