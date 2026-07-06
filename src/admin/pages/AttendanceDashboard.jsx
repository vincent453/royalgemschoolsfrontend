// admin/pages/AttendanceDashboard.jsx
import { useEffect, useState } from "react";
import { FiUser, FiCheck, FiX, FiClock, FiTrendingUp } from "react-icons/fi";
import { getTodayDashboard, getDashboardStats } from "../../services/attendanceApi.js";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="font-jost font-bold text-3xl mt-2" style={{ color }}>
          {value}
        </p>
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  </div>
);

export default function AttendanceDashboard() {
  const [todayData, setTodayData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [todayResult, statsResult] = await Promise.all([
          getTodayDashboard(selectedClass),
          getDashboardStats("daily", selectedClass),
        ]);
        setTodayData(todayResult);
        setStats(statsResult);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedClass]);

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
              <h1 className="font-jost font-bold text-gray-800 text-3xl">Attendance Dashboard</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-1">Manage and monitor student attendance</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {/* Filter */}
            <div className="mb-6">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm"
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                label="Total Students"
                value={stats?.totalStudents || 0}
                icon={FiUser}
                color="#3b82f6"
              />
              <StatCard
                label="Present Today"
                value={todayData?.stats?.present || 0}
                icon={FiCheck}
                color="#10b981"
              />
              <StatCard
                label="Absent Today"
                value={todayData?.stats?.absent || 0}
                icon={FiX}
                color="#ef4444"
              />
              <StatCard
                label="Late Today"
                value={todayData?.stats?.late || 0}
                icon={FiClock}
                color="#f59e0b"
              />
              <StatCard
                label="Attendance %"
                value={`${stats?.attendancePercentage || 0}%`}
                icon={FiTrendingUp}
                color="#8b5cf6"
              />
            </div>

            {/* Recent Records */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg mb-4">Today's Records</h2>

              {todayData?.records && todayData.records.length > 0 ? (
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
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayData.records.map((record, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-dm-sans text-gray-700">
                            {record.student?.firstName} {record.student?.lastName}
                          </td>
                          <td className="px-4 py-3 font-dm-sans text-gray-600">{record.student?.regNumber}</td>
                          <td className="px-4 py-3 font-dm-sans text-gray-600">{record.classLevel}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                record.status === "present"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : record.status === "absent"
                                  ? "bg-red-100 text-red-700"
                                  : record.status === "late"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="font-dm-sans text-gray-400 text-center py-8">No attendance records for today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
