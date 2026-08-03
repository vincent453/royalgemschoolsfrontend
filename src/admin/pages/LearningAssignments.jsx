import { useEffect, useState } from "react";

const API = "https://royalgemschoolsbackend.vercel.app";

export default function LearningAssignments() {
  const [assignments, setAssignments] = useState([]);
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

  const fetchAssignments = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API}/api/learning/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setAssignments(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      fetchAssignments();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
        <p className="text-sm text-gray-500">Create and manage class assignments for students.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input className="border rounded-xl p-3" placeholder="Assignment title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="border rounded-xl p-3" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <input className="border rounded-xl p-3" placeholder="Class level" value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })} required />
          <input type="number" className="border rounded-xl p-3" placeholder="Total marks" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} />
          <input type="date" className="border rounded-xl p-3" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <input className="border rounded-xl p-3" placeholder="Session" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} />
        </div>
        <textarea className="border rounded-xl p-3 w-full" rows="3" placeholder="Assignment description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="px-4 py-2 rounded-xl bg-[#f056f0] text-white text-sm font-semibold">Create Assignment</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Existing Assignments</h2>
        {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
          <div className="space-y-3">
            {assignments.map((item) => (
              <div key={item._id} className="flex items-center justify-between border rounded-xl p-3">
                <div>
                  <p className="font-semibold text-sm text-gray-700">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.subject} • {item.classLevel} • Due {new Date(item.dueDate).toLocaleDateString()}</p>
                </div>
                <span className="text-xs text-gray-500">{item.totalMarks} marks</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
