// admin/pages/AttendanceReport.jsx
import { useState } from "react";
import { FiDownload, FiFilter } from "react-icons/fi";
import { generateAttendanceReport } from "../../services/attendanceApi.js";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const StatusColors = {
  present: "text-emerald-600",
  absent: "text-red-600",
  late: "text-amber-600",
  excused: "text-blue-600",
};

export default function AttendanceReport() {
  const [reportType, setReportType] = useState("daily");
  const [classLevel, setClassLevel] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (classLevel) filters.classLevel = classLevel;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const result = await generateAttendanceReport(reportType, filters);
      setReport(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;

    const html = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-card h3 { margin: 0; color: #666; }
            .stat-card .value { font-size: 24px; font-weight: bold; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .present { color: green; }
            .absent { color: red; }
            .late { color: orange; }
            .excused { color: blue; }
          </style>
        </head>
        <body>
          <h1>Attendance Report</h1>
          <p>Report Type: ${report.reportType}</p>
          <p>Generated: ${new Date(report.generatedAt).toLocaleDateString()}</p>

          <div class="stats">
            <div class="stat-card">
              <h3>Present</h3>
              <div class="value present">${report.statistics.present}</div>
            </div>
            <div class="stat-card">
              <h3>Absent</h3>
              <div class="value absent">${report.statistics.absent}</div>
            </div>
            <div class="stat-card">
              <h3>Late</h3>
              <div class="value late">${report.statistics.late}</div>
            </div>
            <div class="stat-card">
              <h3>Attendance %</h3>
              <div class="value">${report.statistics.percentage}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Reg Number</th>
                <th>Class</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${report.data
                .map(
                  (d) => `
                <tr>
                  <td>${d.studentName}</td>
                  <td>${d.regNumber}</td>
                  <td>${d.classLevel}</td>
                  <td>${new Date(d.date).toLocaleDateString()}</td>
                  <td class="${d.status}">${d.status.toUpperCase()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "", "height=500,width=900");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden rounded-r-2xl shadow-sm relative">
        {/* Sidebar */}
        <div
          className={`fixed md:relative top-[4rem] left-0 z-40 transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} -mt-0 md:-mt-16`}
        >
          <Slidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="font-jost font-bold text-gray-800 text-3xl">Attendance Reports</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-1">Generate and analyze attendance data</p>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <FiFilter size={20} />
                <h2 className="font-jost font-bold text-gray-800">Filters</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="term">Term</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">Class</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm"
                  >
                    <option value="">All Classes</option>
                    <option value="Reception 1">Reception 1</option>
                    <option value="Reception 2">Reception 2</option>
                    <option value="Pre-K">Pre-K</option>
                    <option value="Pre-K">Kindergarten</option>
                    <option value="Pre-K">Primary 1</option>
                    <option value="Pre-K">Primary 2</option>
                    <option value="Pre-K">Primary 3</option>
                    <option value="Pre-K">Primary 4</option>
                    <option value="Pre-K">Primary 5</option>
                    <option value="Pre-K">Primary 6</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 3">SSS 3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-6 py-2 bg-[#f056f0] text-white rounded-lg font-dm-sans font-semibold hover:bg-[#d946a6] disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {/* Report */}
            {report && (
              <>
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: "Total Records", value: report.totalRecords, color: "#3b82f6" },
                    { label: "Present", value: report.statistics.present, color: "#10b981" },
                    { label: "Absent", value: report.statistics.absent, color: "#ef4444" },
                    { label: "Late", value: report.statistics.late, color: "#f59e0b" },
                    { label: "Attendance %", value: `${report.statistics.percentage}%`, color: "#8b5cf6" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                      <p className="font-dm-sans text-xs text-gray-400 uppercase">{stat.label}</p>
                      <p className="font-jost font-bold text-3xl mt-2" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-jost font-bold text-gray-800">Report Data</h2>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-[#f056f0] text-white rounded-lg font-dm-sans text-sm font-semibold hover:bg-[#d946a6]"
                    >
                      <FiDownload /> Export PDF
                    </button>
                  </div>

                  {report.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Student
                            </th>
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Reg Number
                            </th>
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Class
                            </th>
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.data.map((row, i) => (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="px-4 py-3 font-dm-sans text-gray-700">{row.studentName}</td>
                              <td className="px-4 py-3 font-dm-sans text-gray-600">{row.regNumber}</td>
                              <td className="px-4 py-3 font-dm-sans text-gray-600">{row.classLevel}</td>
                              <td className="px-4 py-3 font-dm-sans text-gray-600">
                                {new Date(row.date).toLocaleDateString()}
                              </td>
                              <td className={`px-4 py-3 font-dm-sans font-semibold ${StatusColors[row.status]}`}>
                                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="font-dm-sans text-gray-400 text-center py-8">No data available</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
