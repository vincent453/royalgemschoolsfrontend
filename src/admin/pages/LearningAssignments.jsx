import { useEffect, useState } from "react";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";

const API = "https://royalgemschoolsbackend.vercel.app";

const fallbackAssignments = [
  { _id: "demo-1", title: "English Comprehension Task", subject: "English", classLevel: "JSS 1", description: "Read the passage and answer the questions.", dueDate: "2026-08-10", totalMarks: 20 },
  { _id: "demo-2", title: "Basic Algebra Practice", subject: "Mathematics", classLevel: "SSS 1", description: "Solve the attached algebra worksheet.", dueDate: "2026-08-12", totalMarks: 25 },
];

async function readJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function LearningAssignments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignments, setAssignments] = useState(fallbackAssignments);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    classLevel: "",
    description: "",
    dueDate: "",
    totalMarks: 100,
    session: "2024/2025",
    term: "Term 1",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/learning/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readJsonSafely(response);
      const nextAssignments = Array.isArray(data) && data.length ? data : fallbackAssignments;
      setAssignments(nextAssignments);
      setError(response.ok ? "" : "Live assignment data is unavailable. Showing a ready-to-use view.");
    } catch {
      setAssignments(fallbackAssignments);
      setError("The connection to the learning service is unavailable. Showing sample content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/learning/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, dueDate: new Date(form.dueDate).toISOString() }),
      });

      if (response.ok) {
        setForm({ title: "", subject: "", classLevel: "", description: "", dueDate: "", totalMarks: 100, session: "2024/2025", term: "Term 1" });
        await fetchAssignments();
      } else {
        setError("Assignment could not be saved right now. Please try again later.");
      }
    } catch {
      setError("Assignment could not be saved right now. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="sticky top-0 z-50 w-full">
        <Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 overflow-hidden rounded-r-2xl shadow-sm relative">
        <div className={`fixed md:relative top-[4rem] left-0 z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} -mt-0 md:-mt-16`}>
          <Slidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6">
            <div>
              <h1 className="font-jost font-bold text-gray-800 text-3xl">Assignments</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-1">Create and manage class assignments for students.</p>
            </div>

            {error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input className="border border-gray-200 rounded-xl p-3" placeholder="Assignment title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <input className="border border-gray-200 rounded-xl p-3" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                <input className="border border-gray-200 rounded-xl p-3" placeholder="Class level" value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })} required />
                <input type="number" className="border border-gray-200 rounded-xl p-3" placeholder="Total marks" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} />
                <input type="date" className="border border-gray-200 rounded-xl p-3" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
                <input className="border border-gray-200 rounded-xl p-3" placeholder="Session" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} />
              </div>
              <textarea className="border border-gray-200 rounded-xl p-3 w-full" rows="3" placeholder="Assignment description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button className="px-4 py-2 rounded-xl bg-[#f056f0] text-white text-sm font-semibold">Create Assignment</button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg mb-4">Existing Assignments</h2>
              {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
                <div className="space-y-3">
                  {assignments.map((item) => (
                    <div key={item._id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.subject} • {item.classLevel} • Due {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "TBD"}</p>
                      </div>
                      <span className="text-xs text-gray-500">{item.totalMarks || 0} marks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
