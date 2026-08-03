import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiCreditCard, FiShoppingBag, FiClipboard } from "react-icons/fi";
import SchoolFees from "./SchoolFees";
import ReceiptHistory from "../../pages/accounting/Receipthistory";

const API = "https://royalgemschoolsbackend.vercel.app";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token       = localStorage.getItem("portalToken");
    const cachedInfo  = localStorage.getItem("portalStudent");

    if (!token) { navigate("/portal"); return; }

    // Pre-fill from cache while fetching
    const initialStudent = (() => {
      if (!cachedInfo) return null;
      try {
        return JSON.parse(cachedInfo);
      } catch {
        return null;
      }
    })();

    const fetchData = async () => {
      if (initialStudent) {
        setStudent(initialStudent);
      }
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
      } catch {
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
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#f056f0] via-[#8b5cf6] to-[#525fe1] px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Royal Gem</p>
            <h1 className="text-lg font-bold text-white">Parent Portal</h1>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
            {[
              { label: "Dashboard", path: "/portal/dashboard" },
              { label: "Results", path: "/portal/results" },
              { label: "School Fees", path: "/portal/fees" },
              { label: "Learning", path: "/student/learning" },
              { label: "School Shop", path: "/portal/shop" },
              { label: "My Orders", path: "/portal/shop/orders" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button onClick={handleLogout} className="ml-auto rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white">
            Log Out
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Child Profile Card ── */}
        {student && (
          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#f056f0] to-[#525fe1] px-6 py-6 text-white">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  {student.profilePhoto ? (
                    <img src={student.profilePhoto} alt={student.firstName}
                      className="h-20 w-20 rounded-full border-4 border-white/30 object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-3xl font-bold">
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-white/80">Student overview</p>
                    <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
                    <p className="mt-1 text-sm text-white/80">Reg No: <span className="font-semibold text-white">{student.regNumber}</span></p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{student.classLevel}</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{student.gender}</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{student.session}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3 text-sm text-gray-500">
                {student.parentPhone && <p>📞 {student.parentPhone}</p>}
                {student.parentEmail && <p>✉️ {student.parentEmail}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Results", value: results.length },
                  { label: "Passed", value: results.filter(r => r.resultStatus === "Pass").length },
                  { label: "Best Avg", value: results.length ? Math.max(...results.map(r => Number(r.average))).toFixed(1) : "—" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-[#f5eaf5] px-3 py-4 text-center">
                    <p className="text-lg font-bold text-[#f056f0]">{item.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SchoolFees />
            <ReceiptHistory />
          </div>

          <div className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800">Quick access</h3>
            <p className="mt-1 text-sm text-gray-400">Jump straight to the student portal tools you use most.</p>
            <div className="mt-4 space-y-3">
              {[
                { icon: FiBookOpen, label: "View results", description: "Open the latest academic report cards", path: "/portal/results" },
                { icon: FiCreditCard, label: "Manage fees", description: "Review outstanding balances and payments", path: "/portal/fees" },
                { icon: FiShoppingBag, label: "Browse school shop", description: "Order school essentials and supplies", path: "/portal/shop" },
                { icon: FiClipboard, label: "My orders", description: "Check payment status and deliveries", path: "/portal/shop/orders" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-left transition hover:border-[#f056f0]/30 hover:bg-[#fcf5ff]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f056f0]/10 text-[#f056f0]">
                      <Icon className="text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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