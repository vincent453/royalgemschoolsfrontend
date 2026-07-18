import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolFees from "./SchoolFees";
import ReceiptHistory from "../../pages/accounting/Receipthistory";

const API = "https://royalgemschoolsbackend.vercel.app";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [student,  setStudent]  = useState(null);
  const [results,  setResults]  = useState([]);
  const [fees,     setFees]     = useState([]);
  const [feeLoading, setFeeLoading] = useState(true);
  const [feeError, setFeeError]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState(null); // selected result to view

  useEffect(() => {
    const token       = localStorage.getItem("portalToken");
    const cachedInfo  = localStorage.getItem("portalStudent");

    if (!token) { navigate("/portal"); return; }

    // Pre-fill from cache while fetching
    if (cachedInfo) {
      try { setStudent(JSON.parse(cachedInfo)); } catch {}
    }

    const fetchData = async () => {
      try {
        const payload   = JSON.parse(atob(token.split(".")[1]));
        const studentId = payload.studentId;

        const [studentRes, resultsRes] = await Promise.all([
          fetch(`${API}/api/students/${studentId}`,       { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/results?student=${studentId}`,{ headers: { Authorization: `Bearer ${token}` } }),
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
      } catch (err) {
        setError("Failed to load data. Please try again.");
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

  const statusColor = (s) =>
    s === "Pass" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500";

  const gradeColor = (avg) => {
    const n = Number(avg);
    if (n >= 80) return "text-green-600";
    if (n >= 60) return "text-blue-600";
    if (n >= 40) return "text-orange-500";
    return "text-red-500";
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5eaf5]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#f056f0] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your child's portal...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E6EBEE]">

      {/* ── Topbar ── */}
<header className="sticky top-0 z-40 bg-[#f056f0] h-[60px] flex items-center px-6 shadow-md">

  <h1 className="text-white font-bold text-lg mr-8">
    Parent Portal
  </h1>

  <nav className="hidden md:flex gap-6 text-white text-sm">

    <button onClick={() => navigate("/portal/dashboard")}>
      Dashboard
    </button>

    <button onClick={() => navigate("/portal/results")}>
      Results
    </button>

    <button onClick={() => navigate("/portal/fees")}>
      School Fees
    </button>

    <button onClick={() => navigate("/portal/shop")}>
      🛒 School Shop
    </button>

    <button onClick={() => navigate("/portal/shop/orders")}>
      My Orders
    </button>

  </nav>

  <div className="flex-1" />

  <button
      onClick={handleLogout}
      className="text-white"
  >
      Log Out
  </button>

</header>

      <main className="max-w-5xl mx-auto p-6 flex flex-col gap-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Child Profile Card ── */}
        {student && (
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            {student.profilePhoto ? (
              <img src={student.profilePhoto} alt={student.firstName}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#f056f0]/20 shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#f056f0]/10 flex items-center justify-center shrink-0">
                <span className="text-[#f056f0] font-bold text-3xl">
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </span>
              </div>
            )}

            <div className="flex-1 text-center md:text-left">
              <h2 className="font-jost font-bold text-gray-800 text-2xl">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Reg No: <span className="font-semibold text-[#f056f0]">{student.regNumber}</span>
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

              <div className="mt-3 text-sm text-gray-500 flex flex-col gap-1">
                {student.parentPhone && <p>📞 {student.parentPhone}</p>}
                {student.parentEmail && <p>✉️ {student.parentEmail}</p>}
              </div>
            </div>

            {/* Summary stats */}
            <div className="flex gap-4 shrink-0">
              {[
                { label: "Results",  value: results.length },
                { label: "Passed",   value: results.filter(r => r.resultStatus === "Pass").length },
                { label: "Best Avg", value: results.length ? Math.max(...results.map(r => Number(r.average))).toFixed(1) : "—" },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center bg-[#f5eaf5] rounded-2xl px-4 py-3 min-w-[70px]">
                  <span className="font-jost font-bold text-[#f056f0] text-xl">{s.value}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── School Fees ── */}
        <SchoolFees />

        {/* ── Receipt History ── */}
        <ReceiptHistory />

        {/* ── Results ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-jost font-bold text-gray-800 text-lg mb-4 border-b border-gray-100 pb-3">
            Academic Results
          </h3>

          {results.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No results available yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((r) => (
                <div key={r._id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#f056f0]/30 hover:bg-[#fdf8ff] transition-all duration-200">

                  <div className="flex flex-col gap-0.5">
                    <p className="font-dm-sans font-semibold text-gray-700 text-sm">
                      {r.term} — {r.session}
                    </p>
                    <p className="text-xs text-gray-400">{r.subjects?.length ?? 0} subjects</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-gray-700 text-sm">{r.totalScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Average</p>
                      <p className={`font-bold text-sm ${gradeColor(r.average)}`}>{r.average}%</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${statusColor(r.resultStatus)}`}>
                      {r.resultStatus}
                    </span>
                    <button
                      onClick={() => window.open(`/portal/results/${r._id}`, "_blank")}
                      className="px-4 py-1.5 bg-[#f056f0] text-white text-xs font-semibold rounded-full hover:bg-[#525fe1] transition-colors duration-300">
                      View Card
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