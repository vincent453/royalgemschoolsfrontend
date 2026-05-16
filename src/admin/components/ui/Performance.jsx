import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const Performance = () => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], averages: [] });
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(
          "https://royalgemschoolsbackend.vercel.app/api/results",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) return;

        // Group averages by classLevel
        const classMap = {};
        data.forEach(result => {
          const cls = result.student?.classLevel;
          if (!cls) return;
          if (!classMap[cls]) classMap[cls] = { total: 0, count: 0 };
          classMap[cls].total += Number(result.average) || 0;
          classMap[cls].count += 1;
        });

        const labels   = Object.keys(classMap).sort();
        const averages = labels.map(cls =>
          parseFloat((classMap[cls].total / classMap[cls].count).toFixed(1))
        );

        setChartData({ labels, averages });
      } catch (err) {
        console.error("Performance fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || loading) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(91,79,233,0.25)");
    gradient.addColorStop(1, "rgba(91,79,233,0)");

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.labels.length ? chartData.labels : ["No data"],
        datasets: [
          {
            label: "Avg Score",
            data: chartData.averages.length ? chartData.averages : [0],
            backgroundColor: "#5B4FE9",
            borderRadius: 6,
            barThickness: 20,
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
            callbacks: {
              label: ctx => `Avg: ${ctx.parsed.y}%`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 11 } },
            border: { display: false },
          },
          y: {
            grid: { color: "#f1f5f9" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              callback: v => `${v}%`,
            },
            border: { display: false },
            min: 0,
            max: 100,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [chartData, loading]);

  const totalResults  = chartData.averages.reduce((a, b) => a + b, 0);
  const overallAvg    = chartData.averages.length
    ? (totalResults / chartData.averages.length).toFixed(1)
    : "0";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex-1">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-[15px]">School Performance</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
            <span className="text-xs text-gray-400">Avg Score by Class</span>
            <span className="font-extrabold text-sm text-gray-800">{overallAvg}%</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading...
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </div>
  );
};

export default Performance;