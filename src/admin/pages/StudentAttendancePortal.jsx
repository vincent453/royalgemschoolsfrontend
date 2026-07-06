// admin/pages/StudentAttendancePortal.jsx
// Parent portal for viewing child's attendance
import { useState, useEffect } from "react";
import { FiCalendar, FiTrendingUp, FiCheck, FiX } from "react-icons/fi";
import { getMyAttendance } from "../../services/attendanceApi.js";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const AttendanceCalendar = ({ records, month, year }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = [];
  const statusMap = {};

  records.forEach((record) => {
    const date = new Date(record.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      statusMap[date.getDate()] = record.status;
    }
  });

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const statusColors = {
    present: "#10b981",
    absent: "#ef4444",
    late: "#f59e0b",
    excused: "#8b5cf6",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-jost font-bold text-gray-800 text-lg mb-4">
        {new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </h3>

      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const status = day ? statusMap[day] : null;
          const color = status ? statusColors[status] : null;

          return (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-dm-sans font-semibold ${
                day
                  ? color
                    ? "text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  : ""
              }`}
              style={day && color ? { backgroundColor: color } : {}}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
        {[
          { status: "present", label: "Present", color: "#10b981" },
          { status: "absent", label: "Absent", color: "#ef4444" },
          { status: "late", label: "Late", color: "#f59e0b" },
          { status: "excused", label: "Excused", color: "#8b5cf6" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-dm-sans text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function StudentAttendancePortal() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        const result = await getMyAttendance();
        setAttendance(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E6EBEE] flex items-center justify-center">
        <div className="text-center">
          <span className="w-8 h-8 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin block mx-auto mb-3" />
          <p className="font-dm-sans text-sm text-gray-400">Loading attendance…</p>
        </div>
      </div>
    );
  }

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
              <h1 className="font-jost font-bold text-gray-800 text-3xl">My Attendance</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-1">View your attendance records and statistics</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {/* Statistics */}
            {attendance && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                  {[
                    { label: "Total Days", value: attendance.statistics.totalDays, icon: FiCalendar, color: "#3b82f6" },
                    { label: "Present", value: attendance.statistics.presentDays, icon: FiCheck, color: "#10b981" },
                    { label: "Absent", value: attendance.statistics.absentDays, icon: FiX, color: "#ef4444" },
                    { label: "Late", value: attendance.statistics.lateDays, icon: FiTrendingUp, color: "#f59e0b" },
                    { label: "Excused", value: attendance.statistics.excusedDays, icon: FiCheck, color: "#8b5cf6" },
                    { label: "Percentage", value: `${attendance.statistics.attendancePercentage}%`, icon: FiTrendingUp, color: "#ec4899" },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                        <Icon size={24} style={{ color: stat.color }} className="mx-auto mb-3" />
                        <p className="font-dm-sans text-xs text-gray-400 uppercase">{stat.label}</p>
                        <p className="font-jost font-bold text-2xl mt-2" style={{ color: stat.color }}>
                          {stat.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => {
                        setSelectedMonth(selectedMonth - 1);
                        if (selectedMonth === 0) {
                          setSelectedMonth(11);
                          setSelectedYear(selectedYear - 1);
                        }
                      }}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      ←
                    </button>
                    <h2 className="font-jost font-bold text-gray-800 text-xl flex-1">
                      {new Date(selectedYear, selectedMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedMonth(selectedMonth + 1);
                        if (selectedMonth === 11) {
                          setSelectedMonth(0);
                          setSelectedYear(selectedYear + 1);
                        }
                      }}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      →
                    </button>
                  </div>

                  <AttendanceCalendar
                    records={attendance.records || []}
                    month={selectedMonth}
                    year={selectedYear}
                  />
                </div>

                {/* Recent Records */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-jost font-bold text-gray-800 text-lg mb-4">Recent Records</h3>

                  {attendance.records && attendance.records.length > 0 ? (
                    <div className="space-y-3">
                      {attendance.records.slice(0, 10).map((record, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                          <div>
                            <p className="font-dm-sans font-semibold text-gray-800">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                            {record.remarks && <p className="font-dm-sans text-xs text-gray-400 mt-1">{record.remarks}</p>}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-dm-sans text-gray-400 text-center py-8">No attendance records found</p>
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
