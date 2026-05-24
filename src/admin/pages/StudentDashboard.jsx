import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://royalgemschoolsbackend.vercel.app";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("portalToken");
    const role  = localStorage.getItem("portalRole");

    if (!token || role !== "student") { navigate("/portal"); return; }

    const cached = localStorage.getItem("portalStudent");
    if (cached) {
      try { setStudent(JSON.parse(cached)); } catch {}
    }

    const fetchData = async () => {
      try {
        const payload   = JSON.parse(atob(token.split(".")[1]));
        const studentId = payload.studentId;

        const [studentRes, resultsRes] = await Promise.all([
          fetch(`${API}/api/students/${studentId}`,        { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/results?student=${studentId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (studentRes.ok) {
          const s = await studentRes.json();
          setStudent(s);
          localStorage.setItem("portalStudent", JSON.stringify(s));
        }

        if (resultsRes.ok) {
          const r = await resultsRes.json();
          setResults(Array.isArray(r) ? r : []);
        }
      } catch {
        setError("Failed to load your data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalRole");
    localStorage.removeItem("portalStudent");
    navigate("/portal");
  };

  const gradeColor = (avg) => {
    const n = Number(avg);
    if (n >= 80) return "text-green-600";
    if (n >= 60) return "text-blue-600";
    if (n >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getFinalGrade = (avg) => {
    const n = Number(avg);
    if (n >= 80) return "A";
    if (n >= 70) return "B";
    if (n >= 60) return "C";
    if (n >= 50) return "D";
    if (n >= 40) return "E";
    return "F";
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5eaf5]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#A033A0] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your portal...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E6EBEE]">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-40 bg-[#A033A0] h-[60px] flex items-center px-6 gap-4 shadow-md">
        <h1 className="text-white font-bold text-lg flex-1">Student Portal</h1>
        <span className="text-white/70 text-sm hidden md:block">
          {student ? `Welcome, ${student.firstName}` : ""}
        </span>
        <button onClick={handleLogout}
          className="text-white/80 hover:text-white text-sm font-semibold transition-colors">
          Log Out
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 flex flex-col gap-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Profile Card ── */}
        {student && (
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            {student.profilePhoto ? (
              <img src={student.profilePhoto} alt={student.firstName}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#A033A0]/20 shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#A033A0]/10 flex items-center justify-center shrink-0">
                <span className="text-[#A033A0] font-bold text-3xl">
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </span>
              </div>
            )}

            <div className="flex-1 text-center md:text-left">
              <h2 className="font-jost font-bold text-gray-800 text-2xl">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Reg No: <span className="font-semibold text-[#A033A0]">{student.regNumber}</span>
              </p>

              <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {student.classLevel}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {student.gender}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {student.session}
                </span>
              </div>
            </div>

            {/* Summary stats */}
            <div className="flex gap-4 shrink-0">
              {[
                { label: "Results",   value: results.length },
                { label: "Passed",    value: results.filter(r => r.resultStatus === "Pass").length },
                { label: "Best Avg",  value: results.length ? Math.max(...results.map(r => Number(r.average))).toFixed(1) : "—" },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center bg-[#f5eaf5] rounded-2xl px-4 py-3 min-w-[70px]">
                  <span className="font-jost font-bold text-[#A033A0] text-xl">{s.value}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-jost font-bold text-gray-800 text-lg mb-4 border-b border-gray-100 pb-3">
            My Results
          </h3>

          {results.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No results available yet. Check back after your exams.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r) => (
                <div key={r._id}
                  className="border border-gray-100 rounded-2xl p-5 hover:border-[#A033A0]/30 hover:shadow-sm transition-all duration-200 flex flex-col gap-3">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-dm-sans font-bold text-gray-700">{r.term}</p>
                      <p className="text-xs text-gray-400">{r.session}</p>
                    </div>
                    <span className={`text-2xl font-jost font-black ${gradeColor(r.average)}`}>
                      {getFinalGrade(r.average)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Total",    value: r.totalScore },
                      { label: "Average",  value: `${r.average}%` },
                      { label: "Subjects", value: r.subjects?.length ?? 0 },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-xl py-2">
                        <p className="font-bold text-gray-700 text-sm">{s.value}</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold
                      ${r.resultStatus === "Pass" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                      {r.resultStatus}
                    </span>
                    <button
                      onClick={() => window.open(`/portal/results/${r._id}`, "_blank")}
                      className="px-4 py-1.5 bg-[#A033A0] text-white text-xs font-semibold rounded-full hover:bg-[#525fe1] transition-colors duration-300">
                      View Report Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}