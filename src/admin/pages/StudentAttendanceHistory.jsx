// admin/pages/StudentAttendanceHistory.jsx
import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import * as attendanceApi from "../../services/attendanceApi.js";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const StatusBadge = ({ status }) => {
  const colors = {
    present: "bg-emerald-100 text-emerald-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-amber-100 text-amber-700",
    excused: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function StudentAttendanceHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [session, setSession] = useState("2024/2025");
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setError("Please enter a student ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await attendanceApi.getStudentAttendance(studentId, { term, session });
      setHistory(result);
    } catch (err) {
      setError(err.message);
      setHistory(null);
    } finally {
      setLoading(false);
    }
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
              <h1 className="font-jost font-bold text-gray-800 text-3xl">Student Attendance History</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-1">View detailed attendance records for students</p>
            </div>

            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">Student ID</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Enter student ID or Reg Number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">Term</label>
                    <select
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm"
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">Session</label>
                    <input
                      type="text"
                      value={session}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm bg-gray-50"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2 bg-[#f056f0] text-white rounded-lg font-dm-sans font-semibold hover:bg-[#d946a6] disabled:opacity-50"
                    >
                      {loading ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {/* Results */}
            {history && (
              <>
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                  {[
                    { label: "Total Days", value: history.statistics.totalDays, color: "#3b82f6" },
                    { label: "Present", value: history.statistics.presentDays, color: "#10b981" },
                    { label: "Absent", value: history.statistics.absentDays, color: "#ef4444" },
                    { label: "Late", value: history.statistics.lateDays, color: "#f59e0b" },
                    { label: "Excused", value: history.statistics.excusedDays, color: "#8b5cf6" },
                    { label: "Percentage", value: `${history.statistics.attendancePercentage}%`, color: "#ec4899" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                      <p className="font-dm-sans text-xs text-gray-400 uppercase">{stat.label}</p>
                      <p className="font-jost font-bold text-2xl mt-2" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Student Info */}
                {history.student && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-jost font-bold text-gray-800 text-lg mb-4">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400 uppercase">Name</p>
                        <p className="font-dm-sans font-semibold text-gray-800 mt-1">
                          {history.student.firstName} {history.student.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400 uppercase">Reg Number</p>
                        <p className="font-dm-sans font-semibold text-gray-800 mt-1">{history.student.regNumber}</p>
                      </div>
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400 uppercase">Class</p>
                        <p className="font-dm-sans font-semibold text-gray-800 mt-1">{history.student.classLevel}</p>
                      </div>
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400 uppercase">Session</p>
                        <p className="font-dm-sans font-semibold text-gray-800 mt-1">{history.student.session}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Records Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-jost font-bold text-gray-800 text-lg mb-4">Attendance Records</h3>

                  {history.records && history.records.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Remarks
                            </th>
                            <th className="px-4 py-3 text-left font-dm-sans text-xs text-gray-400 font-semibold uppercase">
                              Recorded By
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.records.map((record, i) => (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="px-4 py-3 font-dm-sans text-gray-700">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={record.status} />
                              </td>
                              <td className="px-4 py-3 font-dm-sans text-gray-600">{record.remarks || "—"}</td>
                              <td className="px-4 py-3 font-dm-sans text-gray-600">{record.recordedBy?.name || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="font-dm-sans text-gray-400 text-center py-8">No attendance records found</p>
                  )}
                </div>
              </>
            )}

            {!history && !loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <FiSearch size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="font-dm-sans text-gray-400">Search for a student to view their attendance history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
