import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const COLORS = ["#a13ea1", "#2563eb", "#059669", "#d97706", "#dc2626", "#0891b2"];

export default function CumulativeAnalysis({ studentId }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`https://royalgemschoolsbackend.vercel.app/api/results/cumulative/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load cumulative analysis");
        return data;
      })
      .then(setAnalysis)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!analysis || !canvasRef.current) return;
    chartRef.current?.destroy();

    const subjectDatasets = analysis.subjects
      .filter((subject) => selectedSubject === "all" || subject.name === selectedSubject)
      .map((subject) => ({
        label: subject.name,
        data: subject.data,
        borderColor: COLORS[analysis.subjects.indexOf(subject) % COLORS.length],
        backgroundColor: "transparent",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        spanGaps: true,
      }));

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: analysis.labels,
        datasets: [
          {
            label: "Overall average",
            data: analysis.averages,
            borderColor: "#f056f0",
            backgroundColor: "rgba(240, 86, 240, 0.12)",
            fill: true,
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 4,
          },
          ...subjectDatasets,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, color: "#6b7280" } },
          tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.y ?? "N/A"}` } },
        },
        scales: {
          y: { min: 0, max: 90, ticks: { color: "#9ca3af" }, title: { display: true, text: "Score out of 90" }, grid: { color: "#f3f4f6" } },
          x: { ticks: { color: "#9ca3af", maxRotation: 35, minRotation: 0 }, grid: { display: false } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [analysis, selectedSubject]);

  return (
    <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm print:hidden">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-dm-sans text-xs font-semibold uppercase tracking-wide text-[#a13ea1]">Cumulative analysis</p>
          <h2 className="mt-1 font-jost text-xl font-bold text-gray-800">Performance across terms</h2>
          <p className="mt-1 font-dm-sans text-sm text-gray-500">Track overall average and subject scores across the student&apos;s recorded terms.</p>
        </div>
        {analysis?.subjects?.length > 0 && (
          <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-[#a13ea1] focus:outline-none">
            <option value="all">All subjects</option>
            {analysis.subjects.map((subject) => <option key={subject.name} value={subject.name}>{subject.name}</option>)}
          </select>
        )}
      </div>
      <div className="mt-5 h-72">
        {loading && <div className="flex h-full items-center justify-center text-sm text-gray-400">Loading cumulative analysis...</div>}
        {!loading && error && <div className="flex h-full items-center justify-center text-sm text-red-500">{error}</div>}
        {!loading && !error && !analysis?.labels?.length && <div className="flex h-full items-center justify-center text-sm text-gray-400">No term results available for analysis.</div>}
        {!loading && !error && analysis?.labels?.length > 0 && <canvas ref={canvasRef} />}
      </div>
    </section>
  );
}
