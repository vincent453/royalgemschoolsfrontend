// admin/pages/MarkAttendance.jsx
import { useEffect, useState } from "react";
import { FiCheck, FiX, FiClock, FiDownload, FiUpload } from "react-icons/fi";
import { getPendingAttendance, bulkCreateAttendance } from "../../services/attendanceApi.js";
import { useAttendance } from "../hooks/useAttendance.js";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const StatusBadge = ({ status, onChange }) => {
  const statuses = [
    { key: "present", label: "Present", color: "bg-emerald-100 text-emerald-700", icon: FiCheck },
    { key: "absent", label: "Absent", color: "bg-red-100 text-red-700", icon: FiX },
    { key: "late", label: "Late", color: "bg-amber-100 text-amber-700", icon: FiClock },
    { key: "excused", label: "Excused", color: "bg-blue-100 text-blue-700" },
  ];

  return (
    <div className="flex gap-2">
      {statuses.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
              status === s.key ? s.color + " ring-2 ring-offset-1" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {Icon && <Icon className="inline mr-1" size={14} />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
};

export default function MarkAttendance() {
  const [classLevel, setClassLevel] = useState("JSS1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [term, setTerm] = useState("Term 1");
  const [session, setSession] = useState("2024/2025");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { recordBulkAttendance } = useAttendance();

  // Load pending attendance
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await getPendingAttendance(classLevel, date);
        setStudents(result.pending || []);

        // Initialize attendance object
        const attendanceMap = {};
        (result.pending || []).forEach((s) => {
          attendanceMap[s._id] = "present";
        });
        setAttendance(attendanceMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [classLevel, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = async () => {
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
        date,
        classLevel,
        session,
        term,
      }));

      if (records.length === 0) {
        setToast({ type: "error", msg: "No attendance to save" });
        return;
      }

      await recordBulkAttendance(records, term);
      setToast({ type: "success", msg: `Successfully saved ${records.length} attendance records` });
      setStudents([]);
      setAttendance({});
    } catch (err) {
      setToast({ type: "error", msg: err.message });
    }
  };

  const markAllPresent = () => {
    const allPresent = {};
    students.forEach((s) => {
      allPresent[s._id] = "present";
    });
    setAttendance(allPresent);
  };

  const markAllAbsent = () => {
    const allAbsent = {};
    students.forEach((s) => {
      allAbsent[s._id] = "absent";
    });
    setAttendance(allAbsent);
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
              <h1 className="font-jost font-bold text-gray-800 text-3xl">Mark Attendance</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-1">Bulk mark attendance for students</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">Class</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg font-dm-sans text-sm"
                  >
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 3">SSS 3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 uppercase mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
              </div>
            </div>

            {/* Bulk Actions */}
            {students.length > 0 && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={markAllPresent}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-dm-sans text-sm font-semibold hover:bg-emerald-600"
                >
                  <FiCheck /> Mark All Present
                </button>
                <button
                  onClick={markAllAbsent}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-dm-sans text-sm font-semibold hover:bg-red-600"
                >
                  <FiX /> Mark All Absent
                </button>
              </div>
            )}

            {/* Attendance List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {loading ? (
                <div className="text-center py-8">
                  <span className="w-6 h-6 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin inline-block mb-3" />
                  <p className="font-dm-sans text-gray-400 text-sm">Loading students…</p>
                </div>
              ) : students.length === 0 ? (
                <p className="font-dm-sans text-gray-400 text-center py-8">
                  No pending attendance for {classLevel} on {date}
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200"
                      >
                        <div>
                          <p className="font-dm-sans font-semibold text-gray-800">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="font-dm-sans text-xs text-gray-400">{student.regNumber}</p>
                        </div>
                        <StatusBadge
                          status={attendance[student._id] || "present"}
                          onChange={(status) => handleStatusChange(student._id, status)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-3 bg-[#f056f0] text-white rounded-lg font-dm-sans font-semibold hover:bg-[#d946a6]"
                    >
                      <FiUpload /> Save Attendance
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg font-dm-sans text-sm font-semibold z-50 ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
